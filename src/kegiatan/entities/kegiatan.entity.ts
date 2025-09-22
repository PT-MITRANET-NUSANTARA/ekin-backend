import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Program } from '../../program/entities/program.entity';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

@Entity('kegiatan')
export class Kegiatan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_anggaran: number;

  @ManyToOne(() => Program)
  @JoinColumn({ name: 'program_id' })
  program_id: Program;

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.kegiatan,
    {
      cascade: true,
    },
  )
  indikator_kinerja_id: IndikatorKinerja[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
