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
import { Tujuan } from '../../tujuan/entities/tujuan.entity';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

@Entity('program')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total_anggaran: number;

  @ManyToOne(() => Tujuan)
  @JoinColumn({ name: 'tujuan_id' })
  tujuan_id: Tujuan;

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.program,
    {
      cascade: true,
      eager: true,
    },
  )
  indikator_kinerja_id: IndikatorKinerja[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
