import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { EUserRole } from 'src/utils/enums/user.enum';
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    identifier: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    const role = req.body.role;
    if (!identifier || !password || !role) {
      throw new BadRequestException('Missing credentials');
    }
    if (role === EUserRole.STUDENT) {
      return await this.authService.validateStudent(identifier, password);
    } else if (Object.values(EUserRole).includes(role)) {
      return await this.authService.validateOther(identifier, password);
    } else {
      throw new BadRequestException('Invalid role');
    }
  }
}
