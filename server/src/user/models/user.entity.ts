import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { EUserRole } from './user.interface';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: EUserRole, default: EUserRole.user })
  role: EUserRole;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @CreateDateColumn({ nullable: false })
  updatedAt: Date;
}
