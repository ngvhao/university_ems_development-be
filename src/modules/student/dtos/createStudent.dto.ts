import { IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dtos/createUser.dto';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class CreateStudentDto extends OmitType(CreateUserDto, [
  'universityEmail',
  'role',
] as const) {
  @ApiProperty({
    description: 'Khóa học (Năm nhập học)',
    example: 2025,
    required: true,
  })
  @IsInt({ message: 'Khóa học phải là số nguyên' })
  @IsNotEmpty({ message: 'Khóa học là bắt buộc' })
  academicYear: number;

  @ApiProperty({
    description: 'Ngày nhập học (định dạng YYYY-MM-DD)',
    example: '2025-09-05',
    type: String,
    format: 'date',
    required: true,
  })
  @IsDateString(
    { strict: true },
    { message: 'Ngày nhập học phải là định dạng YYYY-MM-DD' },
  )
  @IsNotEmpty({ message: 'Ngày nhập học là bắt buộc' })
  enrollmentDate: string;

  @ApiPropertyOptional({
    description: 'Ngày tốt nghiệp dự kiến (định dạng YYYY-MM-DD)',
    example: '2025-09-05',
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    { strict: true },
    { message: 'Ngày tốt nghiệp dự kiến phải là định dạng YYYY-MM-DD' },
  )
  expectedGraduationDate?: string;

  @ApiProperty({
    description: 'ID của Lớp sinh hoạt',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'ID Lớp phải là số nguyên' })
  @IsNotEmpty({ message: 'ID Lớp là bắt buộc' })
  classId: number;
}
