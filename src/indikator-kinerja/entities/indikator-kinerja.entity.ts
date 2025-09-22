import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tujuan } from '../../tujuan/entities/tujuan.entity';
import { Program } from '../../program/entities/program.entity';
import { Kegiatan } from '../../kegiatan/entities/kegiatan.entity';

@Entity('indikator_kinerja')
export class IndikatorKinerja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  target: string;

  @Column()
  satuan: string;

  @ManyToOne(() => Tujuan, (tujuan) => tujuan.indikator_kinerja_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'tujuan_id' })
  tujuan: Tujuan;

  @ManyToOne(() => Program, (program) => program.indikator_kinerja_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ManyToOne(() => Kegiatan, (kegiatan) => kegiatan.indikator_kinerja_id, {
    nullable: true,
  })
  @JoinColumn({ name: 'kegiatan_id' })
  kegiatan: Kegiatan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
