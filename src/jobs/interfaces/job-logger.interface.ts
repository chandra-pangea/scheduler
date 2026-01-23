import { JobExecutionDocument } from '../schemas/job-execution.schema';

export interface IJobLogger {
    logExecution(execution: Partial<JobExecutionDocument>): Promise<JobExecutionDocument>;
    getExecutionHistory(jobId: string, limit?: number): Promise<JobExecutionDocument[]>;
}

