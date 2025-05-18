import { Type } from 'class-transformer';
import { IsInt, IsDateString, ValidateNested } from 'class-validator';
import { ClassWeeklyScheduleDto } from './weeklySchedule.dto';

export class ScheduledClassGroupDto {
  @IsInt()
  groupNumber: number;

  @IsInt()
  maxStudents: number;

  @IsInt()
  lecturerId: number;

  @IsDateString()
  groupStartDate: string;

  @IsDateString()
  groupEndDate: string;

  @IsInt()
  totalTeachingWeeksForGroup: number;

  @IsInt()
  sessionsPerWeekForGroup: number;

  @ValidateNested({ each: true })
  @Type(() => ClassWeeklyScheduleDto)
  weeklyScheduleDetails: ClassWeeklyScheduleDto[];
}
