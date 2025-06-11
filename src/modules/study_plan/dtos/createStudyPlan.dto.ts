import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPositive, IsOptional, IsArray, ArrayUnique } from 'class-validator';

export class CreateStudyPlanDto {
  @ApiPropertyOptional({
    description: 'ID của Sinh viên (chỉ Admin/Manager cần cung cấp)',
    example: 101,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Sinh viên phải là số dương' })
  studentId?: number;

  @ApiProperty({
    description: 'Danh sách ID của các Môn học dự định học',
    example: [15, 20, 25],
    type: [Number],
  })
  @IsArray({ message: 'Danh sách ID Môn học phải là một mảng' })
  @ArrayUnique({
    message: 'Danh sách ID Môn học không được chứa các giá trị trùng lặp',
  })
  @IsPositive({ each: true, message: 'Mỗi ID Môn học phải là số dương' })
  courseIds: number[];
}
