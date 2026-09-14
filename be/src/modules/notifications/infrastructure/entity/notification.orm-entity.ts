import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';

@Entity({ name: 'notifications', schema: 'public' })
export class NotificationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'varchar', length: 255 })
  type: string;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title: string | null;

  @Column({ name: 'body', type: 'text', nullable: true })
  body: string | null;

  @Column({ name: 'data', type: 'json', nullable: true })
  data: Record<string, unknown> | null;

  @Column({ name: 'notifiable_type', type: 'varchar', length: 255 })
  notifiableType: string;

  @Column({ name: 'notifiable_id', type: 'bigint' })
  notifiableId: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ name: 'action_url', type: 'text', nullable: true })
  actionUrl: string | null;

  @Column({ name: 'entity_type', type: 'varchar', length: 255, nullable: true })
  entityType: string | null;

  @Column({ name: 'entity_id', type: 'bigint', nullable: true })
  entityId: string | null;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'notifiable_id' })
  user: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}
