import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
// import { User } from '@/modules/users/domain/entity/user.entity'
import { UserOrmEntity } from '@/modules/users/infrastructure/entity/user.orm.entity';
import { Role } from '@/common/enum/role.enum';
import { InstructorInviteEntity } from '@/modules/auth/entities/instructor-invite.entity';
import { MailService } from '@/modules/auth/services/mail.service';
import { SendInstructorInviteDto } from '@/modules/auth/dto/send-instructor-invite.dto';
import { RegisterInstructorDto } from '@/modules/auth/dto/register-instructor.dto';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { UserRole } from '@/modules/users/domain/enum/user.role';
import { UserStatus } from '@/modules/users/domain/enum/user.status';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    // @InjectRepository(User)
    // private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
    @InjectRepository(InstructorInviteEntity)
    private readonly inviteRepository: Repository<InstructorInviteEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Bước 1: Nhận email và gửi link chứa session mời đăng ký làm giảng viên
   */
  async sendInstructorInvite(dto: SendInstructorInviteDto) {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.userRepository.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email })
      .getOne();

    if (existingUser) {
      if (existingUser.role === UserRole.INSTRUCTOR) {
        throw new ConflictException(
          'Email này đã là tài khoản Giảng viên trong hệ thống. Vui lòng đăng nhập.',
        );
      }
      if (existingUser.role !== UserRole.STUDENT) {
        throw new ConflictException('Email này đã có tài khoản trong hệ thống.');
      }
    }

    // Sinh session token ngẫu nhiên
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    const invite = this.inviteRepository.create({
      email,
      token,
      expiresAt,
      isUsed: false,
    });

    await this.inviteRepository.save(invite);

    try {
      await this.mailService.sendInstructorInvite(invite.email, token);
    } catch (error) {
      await this.inviteRepository.delete(invite.id);
      throw error;
    }

    return {
      success: true,
      message:
        'Link đăng ký tài khoản giảng viên đã được gửi tới email của bạn.',
      email: invite.email,
      expiresAt,
    };
  }

  /**
   * Kiểm tra tính hợp lệ của session token (cho Frontend)
   */
  async verifySession(token: string) {
    const invite = await this.inviteRepository.findOne({
      where: { token, isUsed: false },
    });

    if (!invite || new Date() > invite.expiresAt) {
      throw new BadRequestException(
        'Session đăng ký không hợp lệ hoặc đã hết hạn (quá 30 phút). Vui lòng yêu cầu link mới.',
      );
    }

    return {
      valid: true,
      email: invite.email,
      expiresAt: invite.expiresAt,
      existingAccount: !!(await this.userRepository.createQueryBuilder('user')
        .where('LOWER(user.email) = :email', { email: invite.email })
        .getOne()),
    };
  }

  /**
   * Bước 2: Tạo tài khoản Giảng viên thông qua session token
   */
  async registerInstructor(dto: RegisterInstructorDto) {
    const invite = await this.inviteRepository.findOne({
      where: { token: dto.session, isUsed: false },
    });

    if (!invite) {
      throw new BadRequestException(
        'Session đăng ký không hợp lệ hoặc đã được sử dụng.',
      );
    }

    if (new Date() > invite.expiresAt) {
      throw new BadRequestException(
        'Session đăng ký đã hết hạn (quá 30 phút). Vui lòng yêu cầu gửi lại link.',
      );
    }

    // Kiểm tra tên đăng nhập / email trùng lặp
    const existingEmail = await this.userRepository.createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: invite.email })
      .getOne();
    if (existingEmail) {
      throw new ConflictException('Email đã có tài khoản. Hãy đăng nhập để nâng cấp.');
    }

    const existingName = await this.userRepository.findOne({
      where: { name: dto.name },
    });
    if (existingName) {
      throw new ConflictException(
        'Tên hiển thị này đã có người sử dụng. Vui lòng chọn tên khác.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: invite.email,
      name: dto.name,
      password: hashedPassword,
      role: UserRole.INSTRUCTOR,
      status: 1, // ACTIVE
    });

    const savedUser = await this.userRepository.manager.transaction(async (manager) => {
      const saved = await manager.save(user);
      invite.isUsed = true;
      await manager.save(invite);
      return saved;
    });

    this.logger.log(
      `Đã tạo tài khoản Giảng viên mới thành công: User #${savedUser.id} (${savedUser.email})`,
    );

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Đăng ký tài khoản Giảng viên thành công!',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
      },
      accessToken,
    };
  }

  async upgradeInstructor(session: string, userId: number) {
    if (!session || typeof session !== 'string') {
      throw new BadRequestException('Thiếu mã đăng ký giảng viên.');
    }
    const invite = await this.inviteRepository.findOne({
      where: { token: session, isUsed: false },
    });
    if (!invite || new Date() > invite.expiresAt) {
      throw new BadRequestException('Liên kết đăng ký không hợp lệ hoặc đã hết hạn.');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.email.toLowerCase() !== invite.email) {
      throw new UnauthorizedException('Hãy đăng nhập bằng tài khoản của email nhận liên kết.');
    }
    if (user.role !== UserRole.STUDENT) {
      throw new ConflictException('Tài khoản này không phải tài khoản học viên.');
    }
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tài khoản học viên chưa hoạt động hoặc đã bị khóa.');
    }
    await this.userRepository.manager.transaction(async (manager) => {
      user.role = UserRole.INSTRUCTOR;
      await manager.save(user);
      invite.isUsed = true;
      await manager.save(invite);
    });
    return {
      accessToken: this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  /**
   * Đăng nhập hệ thống
   */
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    };
  }
}
