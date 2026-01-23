import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';

export enum ExecutionStatus {
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Entity('job_executions')
export class JobExecution {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Job)
    job: Job;

    @Column()
    jobId: string;

    @Column({
        type: 'enum',
        enum: ExecutionStatus,
    })
    status: ExecutionStatus;

    @Column({ type: 'timestamp' })
    startedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'jsonb', nullable: true })
    result: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    attemptNumber: number;

    @CreateDateColumn()
    createdAt: Date;
}
