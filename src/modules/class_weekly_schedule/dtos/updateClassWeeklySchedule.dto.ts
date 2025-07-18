import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateClassWeeklyScheduleDto } from './createClassWeeklySchedule.dto';
import { IsNumber, IsOptional } from 'class-validator';
export class UpdateClassWeeklyScheduleDto extends PartialType(
  CreateClassWeeklyScheduleDto,
) {
  @ApiPropertyOptional({
    description: 'ID của lịch học',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsNumber({}, { message: 'ID lịch học phải là số' })
  @IsOptional()
  id?: number;
}
