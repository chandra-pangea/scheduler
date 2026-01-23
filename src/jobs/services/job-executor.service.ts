import { Injectable, Logger } from '@nestjs/common';
import { IJobExecutor } from '../interfaces/job-executor.interface';
import { Job } from '../entities/job.entity';

/**
 * Default job executor that simulates job execution
 * In a real-world scenario, this would be extended or replaced with actual job logic
 * Following Open/Closed Principle - open for extension, closed for modification
 */
@Injectable()
export class DefaultJobExecutor implements IJobExecutor {
    private readonly logger = new Logger(DefaultJobExecutor.name);

    async execute(job: Job): Promise<any> {
        this.logger.log(`Executing job: ${job.name} (${job.id})`);

        // Simulate job execution based on payload
        // In real implementation, this would dispatch to different handlers
        // based on job type or payload

        try {
            // Simulate async work
            await this.simulateWork(job);

            const result = {
                jobId: job.id,
                executedAt: new Date(),
                message: `Job ${job.name} completed successfully`,
                payload: job.payload,
            };

            this.logger.log(`Job ${job.id} completed successfully`);
            return result;
        } catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`);
            throw error;
        }
    }

    private async simulateWork(job: Job): Promise<void> {
        // Simulate different execution times based on job payload
        const delay = job.payload?.duration || 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Simulate random failures for testing retry logic
        if (job.payload?.shouldFail && Math.random() < 0.3) {
            throw new Error('Simulated job failure for testing');
        }
    }
}
