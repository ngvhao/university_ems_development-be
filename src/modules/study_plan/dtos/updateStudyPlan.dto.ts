import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { EStudyPlanStatus } from 'src/utils/enums/study-plan.enum';

export class UpdateStudyPlanDto {
  @ApiPropertyOptional({
    description: 'Cập nhật trạng thái kế hoạch (0: Cancelled, 1: Planned)',
    enum: EStudyPlanStatus,
    example: EStudyPlanStatus.CANCELLED,
  })
  @IsOptional()
  @IsEnum(EStudyPlanStatus, {
    message: 'Trạng thái không hợp lệ (chỉ chấp nhận 0 hoặc 1)',
  })
  status?: EStudyPlanStatus;
}

export class UpdateMutipleStudyPlansDto {
  @ApiPropertyOptional({
    description: 'Cập nhật trạng thái kế hoạch (0: Cancelled, 1: Planned)',
    enum: EStudyPlanStatus,
    example: EStudyPlanStatus.CANCELLED,
  })
  @IsOptional()
  @IsEnum(EStudyPlanStatus, {
    message: 'Trạng thái không hợp lệ (chỉ chấp nhận 0 hoặc 1)',
  })
  status?: EStudyPlanStatus;

  @ApiProperty({
    description: 'Danh sách ID của các kế hoạch học tập',
    example: [15, 20, 25],
    type: [Number],
  })
  @IsArray({ message: 'Danh sách ID kế hoạch học tập phải là một mảng' })
  @ArrayUnique({
    message:
      'Danh sách ID Kế hoạch học tập không được chứa các giá trị trùng lặp',
  })
  @IsPositive({ each: true, message: 'Mỗi ID kế hoạch phải là số dương' })
  studyPlanIds: number[];
}
