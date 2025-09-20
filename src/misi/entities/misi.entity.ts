import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Visi } from '../../visi/entities/visi.entity';

@Entity('misi')
export class Misi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true, default: '' })
  desc: string;

  @Column()
  visi_id: string;

  @ManyToOne(() => Visi, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visi_id' })
  visi: Visi;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
