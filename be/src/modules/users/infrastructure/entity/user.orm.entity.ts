import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
} from 'typeorm';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';
import { UserProfileOrmEntity } from '@/modules/users/infrastructure/entity/user-profile.orm.entity';
import { Role } from '@/common/enum/role.enum';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'int', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'int', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ type: 'varchar', nullable: true })
  block_reason: string | null;

  @Column({ type: 'timestamp', nullable: true })
  blocked_at: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at: Date | null;

  @OneToOne(() => UserProfileOrmEntity, (profile) => profile.user, {
    cascade: true,
  })
  profile: UserProfileOrmEntity | null;
}
