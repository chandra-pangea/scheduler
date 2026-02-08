import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { JobsService } from '../services/jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';
import { QueryJobsDto } from '../dto/query-jobs.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('jobs')
@ApiBearerAuth()
@Controller({ path: 'jobs', version: '1' })
@UseGuards(JwtAuthGuard)
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new job',
        description: `Create a new scheduled job with custom payload data.
        
**Understanding Payload:**
The 'payload' field is a flexible JSON object that contains all the data your job needs to execute. Think of it as the "instructions" for your job.

**Common Patterns:**

1. **Email Notification Job:**
   - payload contains: recipient, subject, template, variables
   
2. **Data Processing Job:**
   - payload contains: data source, filters, output location
   
3. **API Integration Job:**
   - payload contains: endpoint URL, authentication, parameters
   
4. **Backup Job:**
   - payload contains: database name, backup location, retention policy

**Example Request Bodies:**

**One-Time Email Job:**
\`\`\`json
{
  "name": "Send Welcome Email",
  "type": "one_time",
  "scheduledAt": "2026-02-09T10:00:00Z",
  "payload": {
    "emailType": "welcome",
    "recipient": "newuser@example.com",
    "userName": "Jane Doe"
  }
}
\`\`\`

**Recurring Backup Job:**
\`\`\`json
{
  "name": "Daily Database Backup",
  "type": "recurring",
  "recurrencePattern": "daily",
  "scheduledAt": "2026-02-09T02:00:00Z",
  "payload": {
    "database": "production",
    "backupPath": "/backups/daily",
    "compression": true
  }
}
\`\`\`

**Report Generation Job:**
\`\`\`json
{
  "name": "Monthly Sales Report",
  "type": "recurring",
  "recurrencePattern": "monthly",
  "payload": {
    "reportType": "sales",
    "recipients": ["manager@example.com", "ceo@example.com"],
    "format": "pdf",
    "includeCharts": true,
    "dateRange": "last_month"
  }
}
\`\`\`
`
    })
    @ApiResponse({
        status: 201,
        description: 'Job created successfully',
        schema: {
            example: {
                _id: '65b8f1234567890abcdef123',
                name: 'Send Welcome Email',
                description: null,
                type: 'one_time',
                status: 'pending',
                payload: {
                    emailType: 'welcome',
                    recipient: 'newuser@example.com',
                    userName: 'Jane Doe'
                },
                scheduledAt: '2026-02-09T10:00:00.000Z',
                userId: '65b8f1234567890abcdef000',
                retryCount: 0,
                maxRetries: 3,
                isActive: true,
                createdAt: '2026-02-08T16:30:00.000Z',
                updatedAt: '2026-02-08T16:30:00.000Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async createJob(@Request() req, @Body() createJobDto: CreateJobDto) {
        return this.jobsService.createJob(req.user.userId, createJobDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all jobs for the authenticated user' })
    @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getJobs(@Request() req, @Query() query: QueryJobsDto) {
        return this.jobsService.getJobs(req.user.userId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a specific job by ID' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getJob(@Request() req, @Param('id') id: string) {
        return this.jobsService.getJob(id, req.user.userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update a job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job updated successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateJob(
        @Request() req,
        @Param('id') id: string,
        @Body() updateJobDto: UpdateJobDto,
    ) {
        return this.jobsService.updateJob(id, req.user.userId, updateJobDto);
    }

    @Post(':id/cancel')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cancel a job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async cancelJob(@Request() req, @Param('id') id: string) {
        return this.jobsService.cancelJob(id, req.user.userId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 204, description: 'Job deleted successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteJob(@Request() req, @Param('id') id: string) {
        await this.jobsService.deleteJob(id, req.user.userId);
    }

    @Post(':id/reschedule')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reschedule a job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({ status: 200, description: 'Job rescheduled successfully' })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async rescheduleJob(
        @Request() req,
        @Param('id') id: string,
        @Body('scheduledAt') scheduledAt: Date,
    ) {
        return this.jobsService.rescheduleJob(id, req.user.userId, scheduledAt);
    }

    @Get(':id/executions')
    @ApiOperation({ summary: 'Get execution history for a job' })
    @ApiParam({ name: 'id', description: 'Job ID' })
    @ApiResponse({
        status: 200,
        description: 'Execution history retrieved successfully',
    })
    @ApiResponse({ status: 404, description: 'Job not found' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getExecutionHistory(@Request() req, @Param('id') id: string) {
        return this.jobsService.getJobExecutionHistory(id, req.user.userId);
    }
}
