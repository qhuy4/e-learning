import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class LiveKitService {
  constructor(private readonly configService: ConfigService) {}

  async createToken(params: {
    roomName: string;
    identity: string;
    name?: string;
  }) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');

    const token = new AccessToken(apiKey, apiSecret, {
      identity: params.identity,
      name: params.name,
    });

    token.addGrant({
      roomJoin: true,
      room: params.roomName,
      canPublish: true,
      canSubscribe: true,
    });

    return token.toJwt();
  }
}
