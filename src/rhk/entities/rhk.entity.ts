import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum JenisRhk {
  UTAMA = 'UTAMA',
  TAMBAHAN = 'TAMBAHAN',
}

export enum KlasifikasiRhk {
  ORGANISASI = 'ORGANISASI',
  INDIVIDU = 'INDIVIDU',
}

@Entity()
export class Rhk {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  skp_id: number;

  @Column('text')
  desc: string;

  @Column({
    type: 'enum',
    enum: JenisRhk,
    default: JenisRhk.UTAMA,
  })
  jenis: JenisRhk;

  @Column({ nullable: true })
  rhk_atasan_id: number;

  @Column({
    type: 'enum',
    enum: KlasifikasiRhk,
    default: KlasifikasiRhk.ORGANISASI,
  })
  klasifikasi: KlasifikasiRhk;

  @Column({ nullable: true })
  penugasan: string;

  @Column({ nullable: true })
  rkts_id: number;

  @Column({ nullable: true })
  created_by: string;

  @Column({ nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
