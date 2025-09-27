import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SkpStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum SkpPendekatan {
  KUALITATIF = 'KUALITATIF',
  KUANTITATIF = 'KUANTITATIF',
}

export enum SkpCascading {
  NON_DIRECT_CASCADING = 'NON_DIRECT_CASCADING',
  DIRECT_CASCADING = 'DIRECT_CASCADING',
}

@Entity('skp')
export class Skp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  periode_start: Date;

  @Column({ type: 'date' })
  periode_end: Date;

  @Column({
    type: 'enum',
    enum: SkpStatus,
    default: SkpStatus.DRAFT,
  })
  status: SkpStatus;

  @Column({
    type: 'enum',
    enum: SkpPendekatan,
    default: SkpPendekatan.KUANTITATIF,
  })
  pendekatan: SkpPendekatan;

  @Column({
    type: 'enum',
    enum: SkpCascading,
    nullable: true,
  })
  cascading: SkpCascading;

  @Column({
    type: 'json',
    nullable: true,
    default: () => '\'{"sumber_daya": [], "skema": [], "konsekuensi": []}\'',
  })
  lampiran: {
    sumber_daya: string[];
    skema: string[];
    konsekuensi: string[];
  };

  @Column()
  user_id: string;

  @Column({ type: 'json', nullable: true })
  atasan_skp_id: string[];

  @Column({ type: 'json', nullable: true })
  posjab: object[];

  @Column()
  unit_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
