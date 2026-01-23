import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JobExecution, JobExecutionDocument } from '../schemas/job-execution.schema';
import { IJobLogger } from '../interfaces/job-logger.interface';

@Injectable()
export class JobLoggerService implements IJobLogger {
    constructor(
        @InjectModel(JobExecution.name)
        private readonly executionModel: Model<JobExecutionDocument>,
    ) { }

    async logExecution(
        execution: Partial<JobExecutionDocument>,
    ): Promise<JobExecutionDocument> {
        const jobExecution = new this.executionModel({
            ...execution,
            jobId: execution.jobId instanceof Types.ObjectId
                ? execution.jobId
                : execution.jobId ? new Types.ObjectId(execution.jobId as any) : undefined,
        });
        return jobExecution.save();
    }

    async getExecutionHistory(
        jobId: string,
        limit: number = 50,
    ): Promise<JobExecutionDocument[]> {
        return this.executionModel.find({
            jobId: new Types.ObjectId(jobId),
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }
}

