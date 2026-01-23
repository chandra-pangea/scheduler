import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

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

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: JobType,
        default: JobType.ONE_TIME,
    })
    type: JobType;

    @Column({
        type: 'enum',
        enum: JobStatus,
        default: JobStatus.PENDING,
    })
    status: JobStatus;

    @Column({ type: 'jsonb', nullable: true })
    payload: Record<string, any>;

    @Column({ type: 'timestamp', nullable: true })
    scheduledAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    startedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date | null;

    @Column({
        type: 'enum',
        enum: RecurrencePattern,
        nullable: true,
    })
    recurrencePattern: RecurrencePattern | null;

    @Column({ type: 'int', default: 0 })
    retryCount: number;

    @Column({ type: 'int', default: 3 })
    maxRetries: number;

    @Column({ type: 'text', nullable: true })
    errorMessage: string | null;

    @Column({ type: 'jsonb', nullable: true })
    result: Record<string, any> | null;

    @ManyToOne(() => User, (user) => user.jobs)
    user: User;

    @Column()
    userId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextRunAt: Date;

    @Column({ default: true })
    isActive: boolean;
}
