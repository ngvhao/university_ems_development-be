import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { jwtConstants, tokenConstants } from './constants';

export class AuthHelpers {
  static generateToken(
    jwtService: JwtService,
    payload: { id: number; sub: string },
    type: 'access' | 'refresh',
  ): string {
    const isAccessToken = type === 'access';
    return jwtService.sign(payload, {
      secret: isAccessToken
        ? jwtConstants.accessSecret
        : jwtConstants.refreshSecret,
      expiresIn: isAccessToken
        ? jwtConstants.accessExpired
        : jwtConstants.refreshExpired,
    });
  }

  static setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken?: string,
  ): void {
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenConstants.accessTokenMaxAge,
    });

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: tokenConstants.refreshTokenMaxAge,
      });
    }
  }
}
