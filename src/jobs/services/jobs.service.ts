import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument, JobStatus, JobType } from '../schemas/job.schema';
import { JobRepository } from '../repositories/job.repository';
import { BullJobScheduler } from './job-scheduler.service';
import { JobLoggerService } from './job-logger.service';
import { DefaultJobExecutor } from './job-executor.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { QueryJobsDto } from '../dto/query-jobs.dto';
import { ExecutionStatus } from '../schemas/job-execution.schema';

/**
 * Main service orchestrating job operations
 * Follows Single Responsibility Principle by delegating to specialized services
 */
@Injectable()
export class JobsService {
    private readonly logger = new Logger(JobsService.name);

    constructor(
        private readonly jobRepository: JobRepository,
        private readonly jobScheduler: BullJobScheduler,
        private readonly jobLogger: JobLoggerService,
        private readonly jobExecutor: DefaultJobExecutor,
        @InjectModel(Job.name)
        private readonly jobModel: Model<JobDocument>,
    ) { }

    async createJob(userId: string, createJobDto: CreateJobDto): Promise<JobDocument> {
        this.logger.log(`Creating job for user ${userId}: ${createJobDto.name}`);

        const job = await this.jobRepository.create(userId, createJobDto);

        // Schedule the job
        await this.jobScheduler.scheduleJob(job as any);

        return job;
    }

    async getJob(id: string, userId: string): Promise<JobDocument> {
        const job = await this.jobRepository.findById(id, userId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }
        return job;
    }

    async getJobs(
        userId: string,
        query: QueryJobsDto,
    ): Promise<{ jobs: JobDocument[]; total: number; page: number; limit: number }> {
        const { jobs, total } = await this.jobRepository.findAll(userId, query);
        return {
            jobs,
            total,
            page: query.page || 1,
            limit: query.limit || 10,
        };
    }

    async updateJob(
        id: string,
        userId: string,
        updateJobDto: UpdateJobDto,
    ): Promise<JobDocument> {
        this.logger.log(`Updating job ${id} for user ${userId}`);

        const job = await this.jobRepository.update(id, userId, updateJobDto);

        // Reschedule if scheduledAt changed
        if (updateJobDto.scheduledAt) {
            await this.jobScheduler.rescheduleJob(job as any);
        }

        return job;
    }

    async cancelJob(id: string, userId: string): Promise<JobDocument> {
        this.logger.log(`Cancelling job ${id} for user ${userId}`);

        const job = await this.getJob(id, userId);

        if (job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED) {
            throw new Error(`Cannot cancel job in ${job.status} status`);
        }

        job.status = JobStatus.CANCELLED;
        job.isActive = false;
        await job.save();

        await this.jobScheduler.cancelJob(id);

        return job;
    }

    async deleteJob(id: string, userId: string): Promise<void> {
        this.logger.log(`Deleting job ${id} for user ${userId}`);

        await this.jobScheduler.cancelJob(id);
        await this.jobRepository.delete(id, userId);
    }

    async rescheduleJob(
        id: string,
        userId: string,
        scheduledAt: Date,
    ): Promise<JobDocument> {
        this.logger.log(`Rescheduling job ${id} for user ${userId}`);

        const job = await this.jobRepository.update(id, userId, { scheduledAt });
        await this.jobScheduler.rescheduleJob(job as any);

        return job;
    }

    async executeJob(jobId: string): Promise<void> {
        this.logger.log(`Executing job ${jobId}`);

        const job = await this.jobModel.findById(jobId)
            .populate('userId')
            .exec();

        if (!job) {
            this.logger.error(`Job ${jobId} not found`);
            return;
        }

        const execution = await this.jobLogger.logExecution({
            jobId: job._id,
            startedAt: new Date(),
            attemptNumber: job.retryCount + 1,
            status: ExecutionStatus.FAILED, // Will update on success
        });

        try {
            job.status = JobStatus.RUNNING;
            job.startedAt = new Date();
            await job.save();

            const result = await this.jobExecutor.execute(job as any);

            job.status = JobStatus.COMPLETED;
            job.completedAt = new Date();
            job.result = result;
            job.errorMessage = undefined;

            execution.status = ExecutionStatus.SUCCESS;
            execution.completedAt = new Date();
            execution.result = result;

            await job.save();
            await this.jobLogger.logExecution(execution);

            // Handle recurring jobs
            if (job.type === JobType.RECURRING && job.recurrencePattern) {
                await this.scheduleNextRecurrence(job);
            }

            this.logger.log(`Job ${jobId} completed successfully`);
        } catch (error) {
            await this.handleJobFailure(job, execution, error);
        }
    }

    private async handleJobFailure(
        job: JobDocument,
        execution: any,
        error: Error,
    ): Promise<void> {
        this.logger.error(`Job ${job._id} failed: ${error.message}`);

        job.retryCount++;
        job.errorMessage = error.message;

        execution.status = ExecutionStatus.FAILED;
        execution.completedAt = new Date();
        execution.errorMessage = error.message;

        if (job.retryCount >= job.maxRetries) {
            job.status = JobStatus.FAILED;
            this.logger.error(
                `Job ${job._id} failed after ${job.retryCount} attempts`,
            );
            // Here you would typically send a notification to the user
        } else {
            job.status = JobStatus.PENDING;
            this.logger.log(
                `Job ${job._id} will be retried. Attempt ${job.retryCount}/${job.maxRetries}`,
            );
        }

        await job.save();
        await this.jobLogger.logExecution(execution);
    }

    private async scheduleNextRecurrence(job: JobDocument): Promise<void> {
        if (!job.recurrencePattern) {
            return;
        }

        const nextRunAt = this.jobScheduler.calculateNextRunTime(
            new Date(),
            job.recurrencePattern,
        );

        job.nextRunAt = nextRunAt;
        job.status = JobStatus.PENDING;
        job.retryCount = 0;
        job.startedAt = undefined;
        job.completedAt = undefined;

        await job.save();
        await this.jobScheduler.scheduleJob(job as any);

        this.logger.log(
            `Scheduled next recurrence for job ${job._id} at ${nextRunAt}`,
        );
    }

    async getJobExecutionHistory(id: string, userId: string) {
        const job = await this.getJob(id, userId);
        return this.jobLogger.getExecutionHistory(job._id.toString());
    }
}
