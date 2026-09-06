import { User } from '@/modules/users/domain/entity/user.entity';

export class CreatePreviewTokenCommand {
  constructor(
    public readonly user: User,
    public readonly courseId: number,
  ) {}
}
