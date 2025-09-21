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

  @ManyToOne(() => Tujuan, (tujuan) => tujuan.indikator_kinerja_id)
  @JoinColumn({ name: 'tujuan_id' })
  tujuan: Tujuan;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
