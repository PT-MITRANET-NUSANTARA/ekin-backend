import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Misi } from '../../misi/entities/misi.entity';

@Entity('renstra')
export class Renstra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  periode_start: Date;

  @Column({ type: 'date' })
  periode_end: Date;

  @Column()
  unit_id: string;

  @ManyToMany(() => Misi)
  @JoinTable({
    name: 'renstra_misi',
    joinColumn: { name: 'renstra_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'misi_id', referencedColumnName: 'id' },
  })
  misi_id: Misi[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
