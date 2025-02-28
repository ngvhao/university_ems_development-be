import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/modules/user/user.service';
import { jwtConstants } from 'src/utils/constants';
import { EUserRole } from 'src/utils/enums/user.enum';
import { LoggedInterface } from 'src/utils/interfaces/logged.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: any): Promise<LoggedInterface> {
    try {
      const accountDB = await this.userService.getUserById(payload.id);
      if (!accountDB) {
        throw new UnauthorizedException();
      }

      return {
        id: accountDB.id,
        email: accountDB.email ?? '',
        role: accountDB.role || EUserRole.GUEST,
      };
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException();
    }
  }
}
