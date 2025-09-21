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
import { Renstra } from '../../renstra/entities/renstra.entity';
import { IndikatorKinerja } from '../../indikator-kinerja/entities/indikator-kinerja.entity';

@Entity('tujuan')
export class Tujuan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  unit_id: string;

  @ManyToOne(() => Renstra)
  @JoinColumn({ name: 'renstra_id' })
  renstra: Renstra;

  @OneToMany(
    () => IndikatorKinerja,
    (indikatorKinerja) => indikatorKinerja.tujuan,
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
