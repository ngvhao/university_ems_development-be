import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(
    _email: string,
    _password: string,
  ): Promise<UserEntity | null> {
    return null;
  }
}
