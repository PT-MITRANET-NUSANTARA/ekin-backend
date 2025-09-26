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
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  rhk_atasan_id: string;

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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
