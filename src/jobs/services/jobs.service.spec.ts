import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from '../services/jobs.service';
import { JobRepository } from '../repositories/job.repository';
import { BullJobScheduler } from '../services/job-scheduler.service';
import { JobLoggerService } from '../services/job-logger.service';
import { DefaultJobExecutor } from '../services/job-executor.service';
import { Job, JobStatus, JobType, RecurrencePattern } from '../entities/job.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { NotFoundException } from '@nestjs/common';

describe('JobsService', () => {
    let service: JobsService;
    let jobRepository: jest.Mocked<JobRepository>;
    let jobScheduler: jest.Mocked<BullJobScheduler>;
    let jobLogger: jest.Mocked<JobLoggerService>;
    let jobExecutor: jest.Mocked<DefaultJobExecutor>;
    let repository: jest.Mocked<Repository<Job>>;

    const mockJob: Job = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Job',
        description: 'Test Description',
        type: JobType.ONE_TIME,
        status: JobStatus.PENDING,
        payload: { test: 'data' },
        scheduledAt: new Date('2026-01-20T10:00:00Z'),
        startedAt: null,
        completedAt: null,
        recurrencePattern: null,
        retryCount: 0,
        maxRetries: 3,
        errorMessage: null,
        result: null,
        userId: 'user-123',
        user: null as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        nextRunAt: new Date('2026-01-20T10:00:00Z'),
        isActive: true,
    };

    beforeEach(async () => {
        const mockJobRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findPendingJobs: jest.fn(),
            findRecurringJobs: jest.fn(),
        };

        const mockJobScheduler = {
            scheduleJob: jest.fn(),
            cancelJob: jest.fn(),
            rescheduleJob: jest.fn(),
            calculateNextRunTime: jest.fn(),
        };

        const mockJobLogger = {
            logExecution: jest.fn(),
            getExecutionHistory: jest.fn(),
        };

        const mockJobExecutor = {
            execute: jest.fn(),
        };

        const mockRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobsService,
                {
                    provide: JobRepository,
                    useValue: mockJobRepository,
                },
                {
                    provide: BullJobScheduler,
                    useValue: mockJobScheduler,
                },
                {
                    provide: JobLoggerService,
                    useValue: mockJobLogger,
                },
                {
                    provide: DefaultJobExecutor,
                    useValue: mockJobExecutor,
                },
                {
                    provide: getRepositoryToken(Job),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<JobsService>(JobsService);
        jobRepository = module.get(JobRepository);
        jobScheduler = module.get(BullJobScheduler);
        jobLogger = module.get(JobLoggerService);
        jobExecutor = module.get(DefaultJobExecutor);
        repository = module.get(getRepositoryToken(Job));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createJob', () => {
        it('should create a job and schedule it', async () => {
            const createJobDto: CreateJobDto = {
                name: 'Test Job',
                description: 'Test Description',
                type: JobType.ONE_TIME,
                payload: { test: 'data' },
                scheduledAt: new Date('2026-01-20T10:00:00Z'),
                maxRetries: 3,
            };

            jobRepository.create.mockResolvedValue(mockJob);
            jobScheduler.scheduleJob.mockResolvedValue(undefined);

            const result = await service.createJob('user-123', createJobDto);

            expect(result).toEqual(mockJob);
            expect(jobRepository.create).toHaveBeenCalledWith('user-123', createJobDto);
            expect(jobScheduler.scheduleJob).toHaveBeenCalledWith(mockJob);
        });
    });

    describe('getJob', () => {
        it('should return a job by id', async () => {
            jobRepository.findById.mockResolvedValue(mockJob);

            const result = await service.getJob(mockJob.id, 'user-123');

            expect(result).toEqual(mockJob);
            expect(jobRepository.findById).toHaveBeenCalledWith(mockJob.id, 'user-123');
        });

        it('should throw NotFoundException when job not found', async () => {
            jobRepository.findById.mockResolvedValue(null);

            await expect(service.getJob('non-existent', 'user-123')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getJobs', () => {
        it('should return paginated jobs', async () => {
            const mockJobs = [mockJob];
            const queryDto = { page: 1, limit: 10 };

            jobRepository.findAll.mockResolvedValue({
                jobs: mockJobs,
                total: 1,
            });

            const result = await service.getJobs('user-123', queryDto);

            expect(result).toEqual({
                jobs: mockJobs,
                total: 1,
                page: 1,
                limit: 10,
            });
        });
    });

    describe('updateJob', () => {
        it('should update a job', async () => {
            const updateJobDto: UpdateJobDto = {
                name: 'Updated Job',
            };

            const updatedJob = { ...mockJob, ...updateJobDto };
            jobRepository.update.mockResolvedValue(updatedJob);

            const result = await service.updateJob(mockJob.id, 'user-123', updateJobDto);

            expect(result).toEqual(updatedJob);
            expect(jobRepository.update).toHaveBeenCalledWith(
                mockJob.id,
                'user-123',
                updateJobDto,
            );
        });

        it('should reschedule job when scheduledAt is updated', async () => {
            const updateJobDto: UpdateJobDto = {
                scheduledAt: new Date('2026-01-25T10:00:00Z'),
            };

            const updatedJob = { ...mockJob, ...updateJobDto };
            jobRepository.update.mockResolvedValue(updatedJob);
            jobScheduler.rescheduleJob.mockResolvedValue(undefined);

            await service.updateJob(mockJob.id, 'user-123', updateJobDto);

            expect(jobScheduler.rescheduleJob).toHaveBeenCalledWith(updatedJob);
        });
    });

    describe('cancelJob', () => {
        it('should cancel a job', async () => {
            jobRepository.findById.mockResolvedValue(mockJob);
            repository.save.mockResolvedValue({
                ...mockJob,
                status: JobStatus.CANCELLED,
                isActive: false,
            });
            jobScheduler.cancelJob.mockResolvedValue(undefined);

            const result = await service.cancelJob(mockJob.id, 'user-123');

            expect(result.status).toBe(JobStatus.CANCELLED);
            expect(result.isActive).toBe(false);
            expect(jobScheduler.cancelJob).toHaveBeenCalledWith(mockJob.id);
        });

        it('should throw error when trying to cancel completed job', async () => {
            const completedJob = { ...mockJob, status: JobStatus.COMPLETED };
            jobRepository.findById.mockResolvedValue(completedJob);

            await expect(
                service.cancelJob(mockJob.id, 'user-123'),
            ).rejects.toThrow('Cannot cancel job in completed status');
        });
    });

    describe('deleteJob', () => {
        it('should delete a job', async () => {
            jobScheduler.cancelJob.mockResolvedValue(undefined);
            jobRepository.delete.mockResolvedValue(undefined);

            await service.deleteJob(mockJob.id, 'user-123');

            expect(jobScheduler.cancelJob).toHaveBeenCalledWith(mockJob.id);
            expect(jobRepository.delete).toHaveBeenCalledWith(mockJob.id, 'user-123');
        });
    });

    describe('rescheduleJob', () => {
        it('should reschedule a job', async () => {
            const newScheduledAt = new Date('2026-01-25T10:00:00Z');
            const updatedJob = { ...mockJob, scheduledAt: newScheduledAt };

            jobRepository.update.mockResolvedValue(updatedJob);
            jobScheduler.rescheduleJob.mockResolvedValue(undefined);

            const result = await service.rescheduleJob(
                mockJob.id,
                'user-123',
                newScheduledAt,
            );

            expect(result.scheduledAt).toEqual(newScheduledAt);
            expect(jobScheduler.rescheduleJob).toHaveBeenCalledWith(updatedJob);
        });
    });

    describe('executeJob', () => {
        it('should execute a job successfully', async () => {
            const executionResult = { success: true, data: 'result' };

            repository.findOne.mockResolvedValue(mockJob);
            jobLogger.logExecution.mockResolvedValue({} as any);
            jobExecutor.execute.mockResolvedValue(executionResult);
            repository.save.mockResolvedValue({
                ...mockJob,
                status: JobStatus.COMPLETED,
            });

            await service.executeJob(mockJob.id);

            expect(jobExecutor.execute).toHaveBeenCalledWith(mockJob);
            expect(repository.save).toHaveBeenCalled();
        });

        it('should handle job execution failure with retry', async () => {
            const failingJob = { ...mockJob, retryCount: 0, maxRetries: 3 };
            const error = new Error('Execution failed');

            repository.findOne.mockResolvedValue(failingJob);
            jobLogger.logExecution.mockResolvedValue({} as any);
            jobExecutor.execute.mockRejectedValue(error);
            repository.save.mockResolvedValue({
                ...failingJob,
                retryCount: 1,
                status: JobStatus.PENDING,
            });

            await service.executeJob(mockJob.id);

            expect(repository.save).toHaveBeenCalled();
            const savedJob = repository.save.mock.calls[0][0];
            expect(savedJob.retryCount).toBe(1);
            expect(savedJob.status).toBe(JobStatus.PENDING);
        });

        it('should mark job as failed after max retries', async () => {
            const failingJob = { ...mockJob, retryCount: 2, maxRetries: 3 };
            const error = new Error('Execution failed');

            repository.findOne.mockResolvedValue(failingJob);
            jobLogger.logExecution.mockResolvedValue({} as any);
            jobExecutor.execute.mockRejectedValue(error);
            repository.save.mockResolvedValue({
                ...failingJob,
                retryCount: 3,
                status: JobStatus.FAILED,
            });

            await service.executeJob(mockJob.id);

            const savedJob = repository.save.mock.calls[0][0];
            expect(savedJob.retryCount).toBe(3);
            expect(savedJob.status).toBe(JobStatus.FAILED);
        });
    });

    describe('getJobExecutionHistory', () => {
        it('should return execution history for a job', async () => {
            const mockHistory = [
                { id: '1', jobId: mockJob.id, status: 'success' },
            ];

            jobRepository.findById.mockResolvedValue(mockJob);
            jobLogger.getExecutionHistory.mockResolvedValue(mockHistory as any);

            const result = await service.getJobExecutionHistory(mockJob.id, 'user-123');

            expect(result).toEqual(mockHistory);
            expect(jobLogger.getExecutionHistory).toHaveBeenCalledWith(mockJob.id);
        });
    });
});
