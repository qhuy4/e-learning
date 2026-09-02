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
// import { User } from '../users/domain/entity/user.entity'
import { UserOrmEntity } from '../users/infrastructure/entity/user.orm.entity';
import { Role } from '../../common/enum/role.enum';
import { InstructorInviteEntity } from './entities/instructor-invite.entity';
import { MailService } from './services/mail.service';
import { SendInstructorInviteDto } from './dto/send-instructor-invite.dto';
import { RegisterInstructorDto } from './dto/register-instructor.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/domain/enum/user.role';

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
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      if (existingUser.role === UserRole.INSTRUCTOR) {
        throw new ConflictException(
          'Email này đã là tài khoản Giảng viên trong hệ thống. Vui lòng đăng nhập.',
        );
      }
      throw new ConflictException(
        'Email này đã được đăng ký tài khoản Học viên. Vui lòng đăng nhập để nâng cấp tài khoản.',
      );
    }

    // Sinh session token ngẫu nhiên
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 phút

    const invite = this.inviteRepository.create({
      email: dto.email.toLowerCase().trim(),
      token,
      expiresAt,
      isUsed: false,
    });

    await this.inviteRepository.save(invite);

    const { registerUrl } = await this.mailService.sendInstructorInvite(
      invite.email,
      token,
    );

    return {
      success: true,
      message:
        'Link đăng ký tài khoản giảng viên đã được gửi tới email của bạn.',
      email: invite.email,
      expiresAt,
      registerUrl, // Trả về link tiện cho việc test bằng Postman/Dev
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
    const existingEmail = await this.userRepository.findOne({
      where: { email: invite.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email này đã được đăng ký tài khoản.');
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

    const savedUser = await this.userRepository.save(user);

    // Đánh dấu session đã sử dụng
    invite.isUsed = true;
    await this.inviteRepository.save(invite);

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
