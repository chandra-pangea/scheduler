import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { IJobScheduler } from '../interfaces/job-scheduler.interface';
import { Job, RecurrencePattern } from '../entities/job.entity';

@Injectable()
export class BullJobScheduler implements IJobScheduler {
    private readonly logger = new Logger(BullJobScheduler.name);

    constructor(
        @InjectQueue('jobs')
        private readonly jobQueue: Queue,
    ) { }

    async scheduleJob(job: Job): Promise<void> {
        const delay = this.calculateDelay(job.nextRunAt || job.scheduledAt);

        await this.jobQueue.add(
            'execute-job',
            { jobId: job.id },
            {
                delay,
                jobId: job.id,
                removeOnComplete: false,
                removeOnFail: false,
                attempts: job.maxRetries + 1,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        );

        this.logger.log(
            `Scheduled job ${job.id} to run in ${delay}ms at ${job.nextRunAt || job.scheduledAt}`,
        );
    }

    async cancelJob(jobId: string): Promise<void> {
        const job = await this.jobQueue.getJob(jobId);
        if (job) {
            await job.remove();
            this.logger.log(`Cancelled job ${jobId}`);
        }
    }

    async rescheduleJob(job: Job): Promise<void> {
        await this.cancelJob(job.id);
        await this.scheduleJob(job);
        this.logger.log(`Rescheduled job ${job.id}`);
    }

    private calculateDelay(scheduledAt: Date): number {
        const now = new Date();
        const scheduled = new Date(scheduledAt);
        const delay = scheduled.getTime() - now.getTime();
        return Math.max(0, delay);
    }

    calculateNextRunTime(
        currentTime: Date,
        pattern: RecurrencePattern,
    ): Date {
        const next = new Date(currentTime);

        switch (pattern) {
            case RecurrencePattern.HOURLY:
                next.setHours(next.getHours() + 1);
                break;
            case RecurrencePattern.DAILY:
                next.setDate(next.getDate() + 1);
                break;
            case RecurrencePattern.WEEKLY:
                next.setDate(next.getDate() + 7);
                break;
            case RecurrencePattern.MONTHLY:
                next.setMonth(next.getMonth() + 1);
                break;
        }

        return next;
    }
}
