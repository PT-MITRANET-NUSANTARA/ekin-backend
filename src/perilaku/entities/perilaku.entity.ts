import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('perilaku')
export class Perilaku {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  skp_id: string;

  @Column()
  name: string;

  @Column('simple-array')
  content: string[];

  @Column({ default: '' })
  ekspetasi: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
