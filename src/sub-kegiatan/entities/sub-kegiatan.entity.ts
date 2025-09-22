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
import { Kegiatan } from '../../kegiatan/entities/kegiatan.entity';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

@Entity('sub_kegiatan')
export class SubKegiatan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_anggaran: number;

  @ManyToOne(() => Kegiatan)
  @JoinColumn({ name: 'kegiatan_id' })
  kegiatan_id: Kegiatan;

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
