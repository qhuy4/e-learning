import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { User } from '../users/entities/user.entity';
import { InstructorInviteEntity } from './entities/instructor-invite.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailService } from './services/mail.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AdminAuthController } from '@/modules/auth/presentation/controllers/admin-auth.controller';
import { InstructorAuthController } from '@/modules/auth/presentation/controllers/instructor-auth.controller';
// import { TokenService } from '@/modules/auth/service/token.service';
import { TokenService } from '@/common/service/token.service';
import { LoginHandler } from '@/modules/auth/application/command-handler/login.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@/modules/users/user.module';
import { UsersController } from '@/modules/users/presentation/user.controller';
import { RegisterHandler } from '@/modules/auth/application/command-handler/register.handler';
// import { PasswordService } from '@/modules/auth/service/password.service';
import { UserOrmEntity } from '../users/infrastructure/entity/user.orm.entity';
import { PasswordService } from '@/common/service/password.service';
import { ServiceModule } from '@/common/service/service.module';

@Module({
  imports: [
    // TypeOrmModule.forFeature([User, InstructorInviteEntity]),
    TypeOrmModule.forFeature([UserOrmEntity, InstructorInviteEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UserModule,
    CqrsModule,
    ServiceModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'elearning-jwt-secret-key-2026',
        ),
        signOptions: {
          expiresIn: '7d' as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, AdminAuthController, InstructorAuthController, UsersController],
  providers: [AuthService, MailService, JwtStrategy, TokenService, LoginHandler, RegisterHandler, PasswordService],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
