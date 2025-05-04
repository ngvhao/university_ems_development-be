import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
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
