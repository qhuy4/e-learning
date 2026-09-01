import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '@/common/service/password.service';
import { TokenService } from '@/common/service/token.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [PasswordService, TokenService],
  exports: [PasswordService, TokenService],
})
export class ServiceModule {}
