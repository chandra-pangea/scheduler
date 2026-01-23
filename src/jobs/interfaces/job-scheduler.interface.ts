import { Job } from '../entities/job.entity';

export interface IJobScheduler {
    scheduleJob(job: Job): Promise<void>;
    cancelJob(jobId: string): Promise<void>;
    rescheduleJob(job: Job): Promise<void>;
}
