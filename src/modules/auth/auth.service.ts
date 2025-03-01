import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import _ from 'lodash';
import { Helpers } from 'src/utils/helpers';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(
    userCode: string,
    password: string,
  ): Promise<Partial<UserEntity>> {
    const user = await this.userService.getUserByUserCode(userCode);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user && (await Helpers.comparePassword(password, user.password))) {
      return _.omit(user, ['password']);
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async updateRefreshToken({
    userId,
    refreshToken,
  }: {
    userId: number;
    refreshToken: string;
  }): Promise<void> {
    this.userService.updateUser({ refreshToken }, userId);
  }

  async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.userService.getUserById(userId);
    return user?.refreshToken === refreshToken;
  }
}
