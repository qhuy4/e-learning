import { User } from '@/modules/users/domain/entity/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  save(user: User): Promise<User>;

  delete(user: User): Promise<void>;

  create(user: User): Promise<User>;
}
