import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobRepository } from './job.repository';
import { Job, JobStatus, JobType } from '../entities/job.entity';
import { CreateJobDto } from '../dto/create-job.dto';
import { NotFoundException } from '@nestjs/common';

describe('JobRepository', () => {
    let jobRepository: JobRepository;
    let repository: jest.Mocked<Repository<Job>>;

    const mockJob: Partial<Job> = {
        id: '123',
        name: 'Test Job',
        type: JobType.ONE_TIME,
        status: JobStatus.PENDING,
        userId: 'user-123',
    };

    beforeEach(async () => {
        const mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JobRepository,
                {
                    provide: getRepositoryToken(Job),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        jobRepository = module.get<JobRepository>(JobRepository);
        repository = module.get(getRepositoryToken(Job));
    });

    it('should be defined', () => {
        expect(jobRepository).toBeDefined();
    });

    describe('create', () => {
        it('should create a new job', async () => {
            const createJobDto: CreateJobDto = {
                name: 'Test Job',
                type: JobType.ONE_TIME,
                maxRetries: 3,
            };

            repository.create.mockReturnValue(mockJob as Job);
            repository.save.mockResolvedValue(mockJob as Job);

            const result = await jobRepository.create('user-123', createJobDto);

            expect(repository.create).toHaveBeenCalled();
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual(mockJob);
        });
    });

    describe('findById', () => {
        it('should find a job by id', async () => {
            repository.findOne.mockResolvedValue(mockJob as Job);

            const result = await jobRepository.findById('123', 'user-123');

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: '123', userId: 'user-123' },
                relations: ['user'],
            });
            expect(result).toEqual(mockJob);
        });

        it('should return null if job not found', async () => {
            repository.findOne.mockResolvedValue(null);

            const result = await jobRepository.findById('non-existent', 'user-123');

            expect(result).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a job', async () => {
            const updateJobDto = { name: 'Updated Job' };
            const updatedJob = { ...mockJob, ...updateJobDto };

            repository.findOne.mockResolvedValue(mockJob as Job);
            repository.save.mockResolvedValue(updatedJob as Job);

            const result = await jobRepository.update('123', 'user-123', updateJobDto);

            expect(result.name).toBe('Updated Job');
        });

        it('should throw NotFoundException if job not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                jobRepository.update('non-existent', 'user-123', {}),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete a job', async () => {
            repository.findOne.mockResolvedValue(mockJob as Job);
            repository.remove.mockResolvedValue(mockJob as Job);

            await jobRepository.delete('123', 'user-123');

            expect(repository.remove).toHaveBeenCalledWith(mockJob);
        });

        it('should throw NotFoundException if job not found', async () => {
            repository.findOne.mockResolvedValue(null);

            await expect(
                jobRepository.delete('non-existent', 'user-123'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findPendingJobs', () => {
        it('should find all pending jobs', async () => {
            const pendingJobs = [mockJob];
            repository.find.mockResolvedValue(pendingJobs as Job[]);

            const result = await jobRepository.findPendingJobs();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(pendingJobs);
        });
    });

    describe('findRecurringJobs', () => {
        it('should find all recurring jobs', async () => {
            const recurringJobs = [{ ...mockJob, type: JobType.RECURRING }];
            repository.find.mockResolvedValue(recurringJobs as Job[]);

            const result = await jobRepository.findRecurringJobs();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(recurringJobs);
        });
    });
});
