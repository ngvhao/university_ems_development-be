import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateClassWeeklyScheduleDto } from 'src/modules/class_weekly_schedule/dtos/createClassWeeklySchedule.dto';

export class ClassWeeklyScheduleDto extends OmitType(
  CreateClassWeeklyScheduleDto,
  ['dayOfWeek', 'classGroupId', 'startDate', 'endDate'],
) {
  @ApiProperty({
    description: 'Thứ trong tuần (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)',
    example: 1,
    required: true,
  })
  @IsString()
  dayOfWeek: string;
}
