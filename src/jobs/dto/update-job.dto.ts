import { IsOptional, IsEnum, IsDateString, IsObject, IsInt, Min, Max, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecurrencePattern } from '../entities/job.entity';

export class UpdateJobDto {
    @ApiPropertyOptional({ example: 'Updated Job Name' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: { key: 'value' } })
    @IsObject()
    @IsOptional()
    payload?: Record<string, any>;

    @ApiPropertyOptional({ example: '2026-01-25T10:00:00Z' })
    @IsDateString()
    @IsOptional()
    scheduledAt?: Date;

    @ApiPropertyOptional({ enum: RecurrencePattern })
    @IsEnum(RecurrencePattern)
    @IsOptional()
    recurrencePattern?: RecurrencePattern;

    @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 10 })
    @IsInt()
    @Min(0)
    @Max(10)
    @IsOptional()
    maxRetries?: number;
}
