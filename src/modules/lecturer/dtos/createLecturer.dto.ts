// src/modules/lecturer/dtos/createLecturer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dtos/createUser.dto';
import { EAcademicRank } from 'src/utils/enums/user.enum';

export class CreateLecturerDto extends CreateUserDto {
  @ApiProperty({
    description: 'ID của User (đã tồn tại, có role LECTURER) để liên kết',
    example: 10,
    type: Number,
  })
  @IsPositive({ message: 'ID User phải là số dương' })
  @IsNotEmpty({ message: 'ID User không được để trống' })
  userId: number;

  @ApiProperty({
    description: 'ID của Khoa/Bộ môn mà Giảng viên thuộc về',
    example: 5,
    type: Number,
  })
  @IsPositive({ message: 'ID Khoa/Bộ môn phải là số dương' })
  @IsNotEmpty({ message: 'ID Khoa/Bộ môn không được để trống' })
  departmentId: number;

  @ApiPropertyOptional({
    description: 'Học hàm/Học vị (ví dụ: ThS, TS, PGS, GS)',
    example: 'ThS',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Học hàm/Học vị phải là chuỗi' })
  @MaxLength(50, { message: 'Học hàm/Học vị không được vượt quá 50 ký tự' })
  academicRank?: EAcademicRank;

  @ApiPropertyOptional({
    description: 'Chuyên ngành chính',
    example: 'Khoa học Máy tính',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  @MaxLength(255, { message: 'Chuyên ngành không được vượt quá 255 ký tự' })
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu là Trưởng bộ môn? (Chỉ một người/bộ môn)',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trường isHeadDepartment phải là true/false' })
  isHeadDepartment?: boolean = false;
}
