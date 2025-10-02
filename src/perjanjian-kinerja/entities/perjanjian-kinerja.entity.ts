import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('perjanjian_kinerja')
export class PerjanjianKinerja {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  unit_id: string;

  @Column({ type: 'varchar', length: 255 })
  unor_id: string;

  @Column()
  skp_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  created_by: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updated_by: string;
}
