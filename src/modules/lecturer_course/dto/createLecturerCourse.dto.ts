import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateLecturerCourseDto {
  @ApiProperty({
    description: 'ID của Giảng viên',
    example: 1,
    required: true,
  })
  @IsInt({ message: 'ID Giảng viên phải là số nguyên' })
  @IsPositive({ message: 'ID Giảng viên phải là số dương' })
  @IsNotEmpty({ message: 'ID Giảng viên là bắt buộc' })
  lecturerId: number;

  @ApiProperty({
    description: 'ID của Học phần',
    example: 101,
    required: true,
  })
  @IsInt({ message: 'ID Học phần phải là số nguyên' })
  @IsPositive({ message: 'ID Học phần phải là số dương' })
  @IsNotEmpty({ message: 'ID Học phần là bắt buộc' })
  courseId: number;
}
