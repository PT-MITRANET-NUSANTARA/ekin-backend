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

  @Column()
  admin_id: string;

  @Column({ type: 'timestamp' })
  default_harian_time_start: Date;

  @Column({ type: 'timestamp' })
  default_harian_time_end: Date;

  @Column({ type: 'timestamp' })
  default_break_time_start: Date;

  @Column({ type: 'timestamp' })
  default_break_time_end: Date;

  @Column()
  default_total_minuetes: number;

  @Column({ nullable: true })
  bupati_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
