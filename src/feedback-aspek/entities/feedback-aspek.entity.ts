import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('feedback_aspek')
export class FeedbackAspek {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'aspek_id', type: 'varchar', length: 36 })
  aspek_id: string;

  @Column({ name: 'periode_penilaian_id', type: 'varchar', length: 36 })
  periode_penilaian_id: string;

  @Column({ name: 'desc', type: 'text' })
  desc: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}
