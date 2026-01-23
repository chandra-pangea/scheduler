import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument, JobStatus, JobType } from '../schemas/job.schema';
import { IJobRepository } from '../interfaces/job-repository.interface';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { QueryJobsDto } from '../dto/query-jobs.dto';

@Injectable()
export class JobRepository implements IJobRepository {
    constructor(
        @InjectModel(Job.name)
        private readonly jobModel: Model<JobDocument>,
    ) { }

    async create(userId: string, createJobDto: CreateJobDto): Promise<JobDocument> {
        const job = new this.jobModel({
            ...createJobDto,
            userId: new Types.ObjectId(userId),
            status: JobStatus.PENDING,
            nextRunAt: createJobDto.scheduledAt || new Date(),
        });

        return job.save();
    }

    async findById(id: string, userId: string): Promise<JobDocument | null> {
        return this.jobModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
        })
            .populate('userId')
            .exec();
    }

    async findAll(
        userId: string,
        query: QueryJobsDto,
    ): Promise<{ jobs: JobDocument[]; total: number }> {
        const { status, type, fromDate, toDate, page = 1, limit = 10 } = query;

        const filter: any = { userId: new Types.ObjectId(userId) };

        if (status) {
            filter.status = status;
        }

        if (type) {
            filter.type = type;
        }

        if (fromDate && toDate) {
            filter.createdAt = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
            };
        } else if (fromDate) {
            filter.createdAt = { $gte: new Date(fromDate) };
        } else if (toDate) {
            filter.createdAt = { $lte: new Date(toDate) };
        }

        const skip = (page - 1) * limit;

        const [jobs, total] = await Promise.all([
            this.jobModel
                .find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.jobModel.countDocuments(filter).exec(),
        ]);

        return { jobs, total };
    }

    async update(
        id: string,
        userId: string,
        updateJobDto: UpdateJobDto,
    ): Promise<JobDocument> {
        const job = await this.findById(id, userId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        Object.assign(job, updateJobDto);

        if (updateJobDto.scheduledAt) {
            job.nextRunAt = updateJobDto.scheduledAt;
        }

        return job.save();
    }

    async delete(id: string, userId: string): Promise<void> {
        const job = await this.findById(id, userId);
        if (!job) {
            throw new NotFoundException(`Job with ID ${id} not found`);
        }

        await this.jobModel.deleteOne({ _id: job._id }).exec();
    }

    async findPendingJobs(): Promise<JobDocument[]> {
        return this.jobModel.find({
            status: JobStatus.PENDING,
            isActive: true,
            nextRunAt: { $lte: new Date() },
        })
            .populate('userId')
            .exec();
    }

    async findRecurringJobs(): Promise<JobDocument[]> {
        return this.jobModel.find({
            type: JobType.RECURRING,
            isActive: true,
        })
            .populate('userId')
            .exec();
    }
}

