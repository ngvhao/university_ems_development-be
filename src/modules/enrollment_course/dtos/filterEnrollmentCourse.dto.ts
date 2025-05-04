import { IsOptional, IsEnum, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterEnrollmentCourseDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID Sinh viên (chỉ Admin/Manager)',
    example: 101,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Sinh viên phải là số dương' })
  @Type(() => Number)
  studentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Nhóm lớp học',
    example: 25,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Nhóm lớp học phải là số dương' })
  @Type(() => Number)
  classGroupId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đăng ký',
    enum: EEnrollmentStatus,
    example: EEnrollmentStatus.ENROLLED,
  })
  @IsOptional()
  @IsEnum(EEnrollmentStatus, { message: 'Trạng thái đăng ký không hợp lệ' })
  status?: EEnrollmentStatus;
}
