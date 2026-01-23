import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsObject, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JobType, RecurrencePattern } from '../entities/job.entity';

export class CreateJobDto {
    @ApiProperty({ example: 'Send Weekly Report' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ example: 'Generate and send weekly analytics report' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ enum: JobType, example: JobType.ONE_TIME })
    @IsEnum(JobType)
    @IsNotEmpty()
    type: JobType;

    @ApiPropertyOptional({ example: { reportType: 'analytics', recipients: ['admin@example.com'] } })
    @IsObject()
    @IsOptional()
    payload?: Record<string, any>;

    @ApiPropertyOptional({ example: '2026-01-20T10:00:00Z' })
    @IsDateString()
    @IsOptional()
    scheduledAt?: Date;

    @ApiPropertyOptional({ enum: RecurrencePattern, example: RecurrencePattern.WEEKLY })
    @IsEnum(RecurrencePattern)
    @IsOptional()
    recurrencePattern?: RecurrencePattern;

    @ApiPropertyOptional({ example: 3, minimum: 0, maximum: 10 })
    @IsInt()
    @Min(0)
    @Max(10)
    @IsOptional()
    maxRetries?: number;
}
