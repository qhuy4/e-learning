import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserOrmEntity } from './user.orm.entity';

@Entity('user_profiles')
export class UserProfileOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  userId: number;

  @OneToOne(() => UserOrmEntity, (user) => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserOrmEntity;

  @Column({
    type: 'varchar',
    name: 'avatar_url',
    length: 255,
    nullable: true,
  })
  avatarUrl: string | null;

  @Column({ type: 'int', nullable: true })
  gender: number | null;

  @Column({
    type: 'varchar',
    name: 'first_name',
    length: 255,
    nullable: true,
  })
  firstName: string | null;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lastName: string | null;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  phone: string | null;

  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address: string | null;

  @Column({
    type: 'varchar',
    length: 2,
    nullable: true,
  })
  country: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  occupation: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  bio: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;
}