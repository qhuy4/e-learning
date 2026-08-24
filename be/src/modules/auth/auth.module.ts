import { Module } from '@nestjs/common';
import { AuthController } from '@/modules/auth/presentation/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from '@/modules/auth/service/token.service';
import { LoginHandler } from '@/modules/auth/application/command-handler/login.handler';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '@/modules/users/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
  controllers: [AuthController],
  providers: [TokenService, LoginHandler],
})
export class AuthModule {}
