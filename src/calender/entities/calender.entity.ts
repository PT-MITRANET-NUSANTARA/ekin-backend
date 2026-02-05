import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('calender')
@Unique('calender_unit_date_unique', ['unit_id', 'date'])
export class Calender {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  unit_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'boolean', default: false })
  is_holiday: boolean;

  @Column({ nullable: true })
  holiday_name?: string;

  @Column({ type: 'timestamp', nullable: true })
  harian_time_start?: Date;

  @Column({ type: 'timestamp', nullable: true })
  harian_time_end?: Date;

  @Column({ type: 'timestamp', nullable: true })
  break_time_start?: Date;

  @Column({ type: 'timestamp', nullable: true })
  break_time_end?: Date;

  @Column({ type: 'int', nullable: true })
  total_minutes?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
