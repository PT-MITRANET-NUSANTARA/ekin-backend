import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: '197904012005011015' })
  admin_id: string;

  @Column({ type: 'timestamp' })
  default_harian_time_start: Date;

  @Column({ type: 'timestamp' })
  default_harian_time_end: Date;

  @Column({ type: 'timestamp' })
  default_break_time_start: Date;

  @Column({ type: 'timestamp' })
  default_break_time_end: Date;

  @Column({ default: 480 })
  default_total_minuetes: number;

  @Column({ nullable: true, default: '197904012005011015' })
  bupati_id: string;

  @Column('simple-array', { nullable: true, default: 'MON,TUE,WED,THU,FRI' })
  default_work_days: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
