import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('penilaian')
export class Penilaian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  skp_dinilai_id: string;

  @Column()
  skp_penilai_id: string;

  @Column()
  periode_penilaian_id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rating_kinerja: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rating_perilaku: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rating_predikat: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
