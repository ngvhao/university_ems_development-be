import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsPositive, IsOptional } from 'class-validator';

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
    description: 'ID của Học kỳ dự định học',
    example: 5,
    type: Number,
  })
  @IsPositive({ message: 'ID Học kỳ phải là số dương' })
  @IsNotEmpty({ message: 'ID Học kỳ không được để trống' })
  semesterId: number;

  @ApiProperty({
    description: 'ID của Môn học dự định học',
    example: 15,
    type: Number,
  })
  @IsPositive({ message: 'ID Môn học phải là số dương' })
  @IsNotEmpty({ message: 'ID Môn học không được để trống' })
  courseId: number;
}
