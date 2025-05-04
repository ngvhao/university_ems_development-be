import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { EStudyPlanStatus } from 'src/utils/enums/study-plan.enum';

export class FilterStudyPlanDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID Sinh viên',
    example: 101,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Sinh viên phải là số dương' })
  @Type(() => Number)
  studentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Học kỳ',
    example: 5,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Học kỳ phải là số dương' })
  @Type(() => Number)
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Môn học',
    example: 15,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Môn học phải là số dương' })
  @Type(() => Number)
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái kế hoạch (0: Cancelled, 1: Planned)',
    enum: EStudyPlanStatus,
    example: EStudyPlanStatus.PLANNED,
    type: 'number',
  })
  @IsOptional()
  @IsEnum(EStudyPlanStatus, { message: 'Trạng thái không hợp lệ (0 hoặc 1)' })
  @Type(() => Number)
  status?: EStudyPlanStatus;
}
