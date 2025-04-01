import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'userCode' });
  }

  async validate(
    userCode: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    if (!userCode || !password) {
      throw new BadRequestException('Invalid credentials');
    }
    return await this.authService.validateUser(userCode, password);
  }
}
