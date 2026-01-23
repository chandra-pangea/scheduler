import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document;

export enum JobStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum JobType {
    ONE_TIME = 'one_time',
    RECURRING = 'recurring',
}

export enum RecurrencePattern {
    HOURLY = 'hourly',
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
}

@Schema({ timestamps: true, collection: 'jobs' })
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String, enum: JobType, default: JobType.ONE_TIME })
    type: JobType;

    @Prop({ type: String, enum: JobStatus, default: JobStatus.PENDING })
    status: JobStatus;

    @Prop({ type: Object })
    payload: Record<string, any>;

    @Prop({ type: Date })
    scheduledAt: Date;

    @Prop({ type: Date, required: false })
    startedAt?: Date;

    @Prop({ type: Date, required: false })
    completedAt?: Date;

    @Prop({ type: String, enum: RecurrencePattern, required: false })
    recurrencePattern?: RecurrencePattern;

    @Prop({ type: Number, default: 0 })
    retryCount: number;

    @Prop({ type: Number, default: 3 })
    maxRetries: number;

    @Prop({ type: String, required: false })
    errorMessage?: string;

    @Prop({ type: Object, required: false })
    result?: Record<string, any>;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Date })
    nextRunAt: Date;

    @Prop({ type: Boolean, default: true })
    isActive: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);

// Add indexes for better query performance
JobSchema.index({ userId: 1, status: 1 });
JobSchema.index({ scheduledAt: 1 });
JobSchema.index({ nextRunAt: 1 });
