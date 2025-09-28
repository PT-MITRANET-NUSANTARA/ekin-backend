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
import { Rkt } from '../../rkt/entities/rkt.entity';
import { SubKegiatan } from '../../sub-kegiatan/entities/sub-kegiatan.entity';

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
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tujuan_id' })
  tujuan: Tujuan;

  @ManyToOne(() => Program, (program) => program.indikator_kinerja_id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @ManyToOne(() => Kegiatan, (kegiatan) => kegiatan.indikator_kinerja_id, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'kegiatan_id' })
  kegiatan: Kegiatan;

  @ManyToOne(() => Rkt, (rkt) => rkt.input_indikator_kinerja, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'rkt_input_id' })
  rkt_input: Rkt;

  @ManyToOne(() => Rkt, (rkt) => rkt.output_indikator_kinerja, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'rkt_output_id' })
  rkt_output: Rkt;

  @ManyToOne(() => Rkt, (rkt) => rkt.outcome_indikator_kinerja, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'rkt_outcome_id' })
  rkt_outcome: Rkt;

  @ManyToOne(
    () => SubKegiatan,
    (subKegiatan) => subKegiatan.indikator_kinerja_id,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({ name: 'sub_kegiatan_id' })
  sub_kegiatan: SubKegiatan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
