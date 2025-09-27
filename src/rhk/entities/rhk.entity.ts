import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Rkt } from '../../rkt/entities/rkt.entity';

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
  skp_id: string;

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

  @ManyToMany(() => Rkt)
  @JoinTable({
    name: 'rhk_rkt',
    joinColumn: { name: 'rhk_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rkt_id', referencedColumnName: 'id' },
  })
  rkts_id: Rkt[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
