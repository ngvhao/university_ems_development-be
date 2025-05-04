import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class CreateEnrollmentCourseDto {
  @ApiProperty({
    description: 'ID của Nhóm lớp học (ClassGroup) cần đăng ký',
    example: 25,
    required: true,
    type: Number,
  })
  @IsPositive({ message: 'ID Nhóm lớp học phải là số dương' })
  @IsNotEmpty({ message: 'ID Nhóm lớp học không được để trống' })
  classGroupId: number;

  @ApiPropertyOptional({
    description: 'ID của Sinh viên (chỉ dùng bởi Admin/Academic Manager)',
    example: 101,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Sinh viên phải là số dương' })
  studentId?: number;
}
