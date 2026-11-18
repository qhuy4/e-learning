import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@/modules/users/domain/enum/user.role';

export interface CoursePreviewPayload {
  courseId: number;
  userId: number;
  role: UserRole;
  type: string;
}

@Injectable()
export class PreviewTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateCoursePreviewToken(
    courseId: number,
    userId: number | null | undefined,
    role: UserRole,
  ): string {
    return this.jwtService.sign(
      {
        courseId,
        userId: userId ?? 0,
        role,
        type: 'course_preview',
      },
      {
        expiresIn: '2h',
      },
    );
  }

  verifyCoursePreviewToken(token: string): CoursePreviewPayload {
    try {
      const payload = this.jwtService.verify<CoursePreviewPayload>(token);
      if (!payload || payload.type !== 'course_preview' || !payload.courseId) {
        throw new Error('Invalid payload');
      }
      return payload;
    } catch {
      throw new ForbiddenException('Preview token không hợp lệ hoặc đã hết hạn');
    }
  }
}
