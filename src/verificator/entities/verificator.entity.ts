import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Verificator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  unit_id: string;

  @Column('json')
  jabatan: Array<Record<string, string[]>>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
