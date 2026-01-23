import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobExecutionDocument = JobExecution & Document;

export enum ExecutionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Schema({ timestamps: true, collection: 'job_executions' })
export class JobExecution {
    @Prop({ type: Types.ObjectId, ref: 'Job', required: true })
    jobId: Types.ObjectId;

    @Prop({ type: String, enum: ExecutionStatus, required: true })
    status: ExecutionStatus;

    @Prop({ type: Date, required: true })
    startedAt: Date;

    @Prop({ type: Date })
    completedAt: Date;

    @Prop({ type: String })
    errorMessage: string;

    @Prop({ type: Object })
    result: Record<string, any>;

    @Prop({ type: Number, default: 0 })
    attemptNumber: number;
}

export const JobExecutionSchema = SchemaFactory.createForClass(JobExecution);

// Add indexes
JobExecutionSchema.index({ jobId: 1, createdAt: -1 });
