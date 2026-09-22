import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: number) {
    return this.jwtService.sign(
      {
        sub: userId,
        type: 'access',
      },
      {
        expiresIn: '15m',
      },
    );
  }

  generateRefreshToken(userId: number): {
    token: string;
    jti: string;
  } {
    const jti = randomUUID();

    const token = this.jwtService.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      {
        jwtid: jti,
        expiresIn: '30d',
      },
    );

    return {
      token,
      jti,
    };
  }

  verifyRefreshToken(token: string) {
    return this.jwtService.verify(token);
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
