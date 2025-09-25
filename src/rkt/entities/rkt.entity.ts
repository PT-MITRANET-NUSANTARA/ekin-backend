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
import { SubKegiatan } from '../../sub-kegiatan/entities/sub-kegiatan.entity';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

export enum RktLabel {
  KINERJA_BERBASIS_ANGGARAN = 'KINERJA_BERBASIS_ANGGARAN',
  KINERJA_NON_ANGGARAN = 'KINERJA_NON_ANGGARAN',
}

@Entity('rkt')
export class Rkt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit_id: string;

  @Column({
    type: 'enum',
    enum: RktLabel,
    default: RktLabel.KINERJA_BERBASIS_ANGGARAN,
  })
  label: RktLabel;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_anggaran: number;

  @Column()
  renstra_id: string;

  @OneToMany(() => SubKegiatan, (subKegiatan) => subKegiatan.rkt, {
    cascade: true,
  })
  sub_kegiatan_id: SubKegiatan[];

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.rkt_input,
    {
      cascade: true,
    },
  )
  input_indikator_kinerja: IndikatorKinerja[];

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.rkt_output,
    {
      cascade: true,
    },
  )
  output_indikator_kinerja: IndikatorKinerja[];

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.rkt_outcome,
    {
      cascade: true,
    },
  )
  outcome_indikator_kinerja: IndikatorKinerja[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
