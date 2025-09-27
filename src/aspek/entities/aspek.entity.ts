import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

export enum JenisAspek {
  KUALITAS = 'KUALITAS',
  KUANTITAS = 'KUANTITAS',
  WAKTU = 'WAKTU',
  DESKRIPSI = 'DESKRIPSI',
}

@Entity()
export class Aspek {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rhk_id: string;

  @Column({
    type: 'enum',
    enum: JenisAspek,
    default: JenisAspek.KUALITAS,
  })
  jenis: JenisAspek;

  @Column('text', { nullable: true })
  desc: string;

  @ManyToOne(() => IndikatorKinerja, { nullable: true })
  @JoinColumn({ name: 'indikator_kinerja_id' })
  indikator_kinerja: IndikatorKinerja;

  @Column({ nullable: true })
  indikator_kinerja_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
