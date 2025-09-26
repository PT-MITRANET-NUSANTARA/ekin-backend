import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rencana_aksi')
export class RencanaAksi {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  skp_id: string;

  @Column()
  rhk_id: string;

  @Column()
  periode_penilaian_id: string;

  @Column({ type: 'date' })
  periode_start: Date;

  @Column({ type: 'date' })
  periode_end: Date;

  @Column({ type: 'text' })
  desc: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
