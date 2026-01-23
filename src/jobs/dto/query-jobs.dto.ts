import { IsOptional, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JobStatus, JobType } from '../entities/job.entity';
import { Type } from 'class-transformer';

export class QueryJobsDto {
    @ApiPropertyOptional({ enum: JobStatus })
    @IsEnum(JobStatus)
    @IsOptional()
    status?: JobStatus;

    @ApiPropertyOptional({ enum: JobType })
    @IsEnum(JobType)
    @IsOptional()
    type?: JobType;

    @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
    @IsDateString()
    @IsOptional()
    fromDate?: Date;

    @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
    @IsDateString()
    @IsOptional()
    toDate?: Date;

    @ApiPropertyOptional({ example: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;
}
