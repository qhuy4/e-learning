import { User } from '@/modules/users/domain/entity/user.entity';
import { FindUsersOptions } from '@/modules/users/infrastructure/repository/user.repository';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<User>;

  delete(user: User): Promise<void>;

  create(user: User): Promise<User>;

  findAll(option: FindUsersOptions): Promise<{
    users: User[];
    total: number;
  }>;
}
