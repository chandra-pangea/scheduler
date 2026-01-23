import { Job } from '../entities/job.entity';

export interface IJobExecutor {
    execute(job: Job): Promise<any>;
}
