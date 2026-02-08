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

    @ApiPropertyOptional({
        description: `Flexible JSON object containing data and parameters needed for job execution.
        
The payload can contain ANY data your job needs to perform its task. Common use cases:

**Email Job Example:**
{
  "emailType": "welcome",
  "recipient": "user@example.com",
  "userName": "John Doe",
  "templateId": "welcome-v2"
}

**Database Backup Example:**
{
  "database": "production_db",
  "backupLocation": "s3://backups/",
  "compression": "gzip",
  "retentionDays": 30
}

**Report Generation Example:**
{
  "reportType": "sales",
  "startDate": "2026-02-01",
  "endDate": "2026-02-28",
  "recipients": ["manager@example.com"],
  "format": "pdf",
  "includeCharts": true
}

**API Integration Example:**
{
  "apiEndpoint": "https://api.example.com/sync",
  "apiKey": "your-api-key",
  "syncType": "incremental",
  "batchSize": 100
}

**Data Cleanup Example:**
{
  "collection": "old_logs",
  "olderThan": "90 days",
  "batchSize": 1000,
  "dryRun": false
}

The payload is stored with the job and passed to the executor during execution. You can access it in your custom job executor to determine what actions to perform.`,
        example: {
            reportType: 'analytics',
            recipients: ['admin@example.com'],
            format: 'pdf',
            includeCharts: true
        },
        required: false,
    })
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
