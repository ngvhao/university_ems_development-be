import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { EUserRole } from 'src/utils/enums/user.enum';

export class LoginDto {
  @ApiProperty({
    description:
      'Mã đăng nhập của người dùng. Với sinh viên là mã sinh viên, giảng viên, admin là email đại học.',
    example: 'SV20240123 or example@university.edu.vn',
  })
  @IsNotEmpty({ message: 'Identifier không được để trống' })
  @IsString({ message: 'Identifier phải là chuỗi' })
  identifier: string;

  @ApiProperty({
    description: 'Mật khẩu đăng nhập của người dùng',
    example: 'yourSecurePassword123',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  password: string;

  @ApiProperty({
    description:
      'Vai trò người dùng đăng nhập (ví dụ: STUDENT, LECTURER, ADMIN)',
    enum: EUserRole,
    example: EUserRole.STUDENT,
  })
  role: EUserRole;
}
