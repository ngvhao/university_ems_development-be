import { IsNotEmpty } from 'class-validator';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export class RequestHasUserDTO {
  @IsNotEmpty({ message: 'User must be provided.' })
  user: UserEntity;

  constructor(user: UserEntity) {
    this.user = user;
  }
}
