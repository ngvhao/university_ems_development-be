import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_VALID_REGEX } from 'src/utils/constants';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class ResetPasswordDto {
  @IsNotEmpty()
  token: string;
  @Matches(PASSWORD_VALID_REGEX, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @Matches(PASSWORD_VALID_REGEX, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  newPassword: string;
}
