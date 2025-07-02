import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import _ from 'lodash';
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
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.accessToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessSecret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async validate(payload: {
    id: number;
    sub: string;
    role: EUserRole;
  }): Promise<LoggedInterface> {
    try {
      const user = await this.userService.getUserById(payload.id);
      if (!user) {
        throw new UnauthorizedException();
      }
      const result = _.omit(user, ['password']) as unknown as LoggedInterface;
      return result;
    } catch (error) {
      this.logger.error(`JWT validation failed: ${error.message}`);
      throw new UnauthorizedException();
    }
  }
}
