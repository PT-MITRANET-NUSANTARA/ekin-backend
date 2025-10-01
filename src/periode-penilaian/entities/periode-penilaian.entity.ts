import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('periode_penilaian')
export class PeriodePenilaian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  periode_start: Date;

  @Column({ type: 'date' })
  periode_end: Date;

  @Column()
  unit_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  renstra_id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
