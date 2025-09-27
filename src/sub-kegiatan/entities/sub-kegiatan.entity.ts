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
import { Rkt } from '../../rkt/entities/rkt.entity';

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

  @ManyToOne(() => Rkt, (rkt) => rkt.sub_kegiatan_id)
  @JoinColumn({ name: 'rkt_id' })
  rkt: Rkt;

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.sub_kegiatan,
    {
      cascade: true,
      eager: true,
    },
  )
  indikator_kinerja_id: IndikatorKinerja[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
