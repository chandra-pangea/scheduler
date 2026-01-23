import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { Job, JobSchema } from './schemas/job.schema';
import { JobExecution, JobExecutionSchema } from './schemas/job-execution.schema';
import { JobsController } from './controllers/jobs.controller';
import { JobsService } from './services/jobs.service';
import { JobRepository } from './repositories/job.repository';
import { BullJobScheduler } from './services/job-scheduler.service';
import { JobLoggerService } from './services/job-logger.service';
import { DefaultJobExecutor } from './services/job-executor.service';
import { JobProcessor } from './processors/job.processor';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Job.name, schema: JobSchema },
            { name: JobExecution.name, schema: JobExecutionSchema },
        ]),
        BullModule.registerQueue({
            name: 'jobs',
        }),
    ],
    controllers: [JobsController],
    providers: [
        JobsService,
        JobRepository,
        BullJobScheduler,
        JobLoggerService,
        DefaultJobExecutor,
        JobProcessor,
    ],
    exports: [JobsService],
})
export class JobsModule { }

