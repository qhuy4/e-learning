import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '@/common/service/password.service';
import { TokenService } from '@/common/service/token.service';
import { PreviewTokenService } from '@/common/service/preview-token.service';

import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'JWT_SECRET',
          'elearning-jwt-secret-key-2026',
        ),
        signOptions: {
          expiresIn: '2h',
        },
      }),
    }),
  ],
  providers: [PasswordService, TokenService, PreviewTokenService],
  exports: [PasswordService, TokenService, PreviewTokenService],
})
export class ServiceModule {}
