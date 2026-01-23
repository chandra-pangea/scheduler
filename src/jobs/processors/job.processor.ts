import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job as BullJob } from 'bull';
import { JobsService } from '../services/jobs.service';

@Processor('jobs')
export class JobProcessor {
    private readonly logger = new Logger(JobProcessor.name);

    constructor(private readonly jobsService: JobsService) { }

    @Process('execute-job')
    async handleJobExecution(job: BullJob<{ jobId: string }>) {
        this.logger.log(`Processing job from queue: ${job.data.jobId}`);

        try {
            await this.jobsService.executeJob(job.data.jobId);
            this.logger.log(`Successfully processed job: ${job.data.jobId}`);
        } catch (error) {
            this.logger.error(
                `Error processing job ${job.data.jobId}: ${error.message}`,
            );
            throw error; // Bull will handle retry based on job options
        }
    }
}
