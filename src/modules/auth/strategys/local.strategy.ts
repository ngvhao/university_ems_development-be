import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'identifier',
      passwordField: 'password',
    });
  }

  async validate(
    identifier: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    if (!identifier || !password) {
      throw new BadRequestException('Missing credentials');
    }
    return await this.authService.validateUser(identifier, password);
  }
}
