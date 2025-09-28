import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  model: string;

  @Column()
  model_id: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: OperationType,
  })
  operation: OperationType;

  @CreateDateColumn()
  created_at: Date;
}
