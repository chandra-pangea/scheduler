import { JobDocument } from '../schemas/job.schema';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { QueryJobsDto } from '../dto/query-jobs.dto';

export interface IJobRepository {
    create(userId: string, createJobDto: CreateJobDto): Promise<JobDocument>;
    findById(id: string, userId: string): Promise<JobDocument | null>;
    findAll(userId: string, query: QueryJobsDto): Promise<{ jobs: JobDocument[]; total: number }>;
    update(id: string, userId: string, updateJobDto: UpdateJobDto): Promise<JobDocument>;
    delete(id: string, userId: string): Promise<void>;
    findPendingJobs(): Promise<JobDocument[]>;
    findRecurringJobs(): Promise<JobDocument[]>;
}

