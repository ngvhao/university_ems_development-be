import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EUserRole } from 'src/utils/enums/user.enum';
import { PHONE_NUMBER_REGEX } from 'src/utils/constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email cá nhân (duy nhất)',
    example: 'example@personal.com',
    required: true,
  })
  @IsNotEmpty({ message: 'Email cá nhân là bắt buộc' })
  @IsEmail({}, { message: 'Email cá nhân không hợp lệ' })
  personalEmail: string;

  @ApiProperty({
    description: 'Email trường (duy nhất)',
    example: 'example@university.edu.vn',
    required: true,
  })
  @IsNotEmpty({ message: 'Email trường là bắt buộc' })
  @IsEmail({}, { message: 'Email trường không hợp lệ' })
  universityEmail: string;

  @ApiProperty({ description: 'Tên', example: 'Văn', required: true })
  @IsNotEmpty({ message: 'Tên là bắt buộc' })
  @IsString({ message: 'Tên phải là chuỗi' })
  firstName: string;

  @ApiProperty({ description: 'Họ', example: 'Nguyễn', required: true })
  @IsNotEmpty({ message: 'Họ là bắt buộc' })
  @IsString({ message: 'Họ phải là chuỗi' })
  lastName: string;

  // @ApiPropertyOptional({
  //   description: 'URL ảnh đại diện',
  //   example: '/avatar.jpg',
  // })
  @IsOptional()
  @IsString({ message: 'URL ảnh đại diện phải là chuỗi' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Vai trò người dùng',
    enum: EUserRole,
    default: EUserRole.ADMINISTRATOR,
    example: EUserRole.ADMINISTRATOR,
  })
  @IsOptional()
  @IsEnum([EUserRole.ADMINISTRATOR, EUserRole.ACADEMIC_MANAGER], {
    message: 'Vai trò không hợp lệ',
  })
  role?: EUserRole = EUserRole.ADMINISTRATOR;

  @ApiPropertyOptional({
    description: 'Số điện thoại (định dạng Việt Nam)',
    example: '0987654321',
  })
  @IsOptional()
  @Matches(PHONE_NUMBER_REGEX, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Số Căn cước công dân/Chứng minh nhân dân',
    example: '012345678912',
  })
  @IsString({ message: 'Số CCCD/CMND phải là chuỗi' })
  identityCardNumber: string;

  @ApiPropertyOptional({
    description: 'Ngày sinh (định dạng ISO 8601 YYYY-MM-DD)',
    example: '2000-12-31',
    type: String,
    format: 'date',
  })
  @IsDateString(
    { strict: true },
    { message: 'Ngày sinh phải là định dạng YYYY-MM-DD' },
  )
  dateOfBirth: string;

  @ApiPropertyOptional({ description: 'Giới tính', example: 'Nam' })
  @IsString({ message: 'Giới tính phải là chuỗi' })
  gender: string;

  @ApiPropertyOptional({ description: 'Quê quán', example: 'Hà Nội' })
  @IsOptional()
  @IsString({ message: 'Quê quán phải là chuỗi' })
  hometown?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ thường trú',
    example: 'Số 1, Đường ABC, Quận XYZ, TP HCM',
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ thường trú phải là chuỗi' })
  permanentAddress?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ tạm trú',
    example: 'Số 2, Đường DEF, Quận UVW, TP HCM',
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ tạm trú phải là chuỗi' })
  temporaryAddress?: string;

  @ApiPropertyOptional({ description: 'Quốc tịch', example: 'Việt Nam' })
  @IsOptional()
  @IsString({ message: 'Quốc tịch phải là chuỗi' })
  nationality?: string;

  @ApiPropertyOptional({ description: 'Dân tộc', example: 'Kinh' })
  @IsOptional()
  @IsString({ message: 'Dân tộc phải là chuỗi' })
  ethnicity?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu', example: 'Matkhau123@', required: false })
  @IsOptional()
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  password?: string;

  @ApiPropertyOptional({ description: 'Token đặt lại mật khẩu', example: 'uuid-token', required: false })
  @IsOptional()
  resetPasswordToken?: string;
}
