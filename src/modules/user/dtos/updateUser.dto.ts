import { IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { CreateUserDto } from './createUser.dto';
import { PartialType } from '@nestjs/swagger';
import { PASSWORD_VALID_REGEX } from 'src/utils/constants';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNotEmpty()
  @Matches(PASSWORD_VALID_REGEX, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password?: string;
}
