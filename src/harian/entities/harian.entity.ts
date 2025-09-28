import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RencanaAksi } from '../../rencana-aksi/entities/rencana-aksi.entity';

@Entity('harian')
export class Harian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  skp_id: number;

  @Column({ type: 'boolean', default: false })
  is_skp: boolean;

  @Column({ type: 'timestamp' })
  start_date_time: Date;

  @Column({ type: 'timestamp' })
  end_date_time: Date;

  @Column({ type: 'int' })
  progress: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  desc: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tautan: string;

  @Column({ type: 'json', nullable: true })
  files: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relasi many-to-many dengan rencana aksi
  @ManyToMany(() => RencanaAksi)
  @JoinTable({
    name: 'harian_rencana_aksi',
    joinColumn: { name: 'harian_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rencana_aksi_id', referencedColumnName: 'id' },
  })
  rencana_aksi: RencanaAksi[];
}
