import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AbsenceStatus {
  HADIR = 'HADIR',
  SAKIT = 'SAKIT',
  IZIN = 'IZIN',
  ALPHA = 'ALPHA',
  TANPA_KETERANGAN = 'TANPA_KETERANGAN',
  DINAS = 'DINAS',
}

@Entity('absence')
export class Absence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: AbsenceStatus,
    default: AbsenceStatus.HADIR,
  })
  status: AbsenceStatus;

  @Column()
  unit_id: string;

  @Column({ nullable: true })
  desc: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
