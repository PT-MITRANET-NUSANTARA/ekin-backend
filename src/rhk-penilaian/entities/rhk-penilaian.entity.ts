import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('rhk_penilaian')
export class RhkPenilaian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rhk_id: string;

  @Column()
  skp_id: string;

  @Column()
  periode_penilaian_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
