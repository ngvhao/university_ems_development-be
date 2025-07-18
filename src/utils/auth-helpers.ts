import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { jwtConstants, tokenConstants } from './constants';
import { EUserRole } from './enums/user.enum';

export class AuthHelpers {
  static generateToken(
    jwtService: JwtService,
    payload: {
      id: number;
      sub: string;
      role: EUserRole;
      isHeadOfFaculty: boolean;
    },
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
    const isProduction = process.env.NODE_ENV === 'production';

    const baseCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
    };

    res.cookie('accessToken', accessToken, {
      ...baseCookieOptions,
      maxAge: tokenConstants.accessTokenMaxAge,
    });

    if (refreshToken) {
      res.cookie('refreshToken', refreshToken, {
        ...baseCookieOptions,
        maxAge: tokenConstants.refreshTokenMaxAge,
      });
    }
  }

  static setExpireTokens(res: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
    });

    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 0,
    });
  }
}
