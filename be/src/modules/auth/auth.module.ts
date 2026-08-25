import { Module } from '@nestjs/common';
import { AdminAuthController } from '@/modules/auth/presentation/controllers/admin-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '@/modules/auth/service/token.service';
import { LoginHandler } from '@/modules/auth/application/command-handler/login.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@/modules/users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersController } from '@/modules/users/presentation/user.controller';
import { RegisterHandler } from '@/modules/auth/application/command-handler/register.handler';
import { PasswordService } from '@/modules/auth/service/password.service';

@Module({
  imports: [
    UserModule,
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [AdminAuthController, UsersController],
  providers: [TokenService, LoginHandler, RegisterHandler, PasswordService],
})
export class AuthModule {}
