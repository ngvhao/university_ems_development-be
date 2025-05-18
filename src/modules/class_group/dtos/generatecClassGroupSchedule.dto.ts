import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ScheduledCourseDto } from './scheduledCourse.dto';

export class GenerateScheduleResponseDto {
  @IsInt()
  semesterId: number;

  @IsDateString()
  semesterStartDate: string;

  @IsDateString()
  semesterEndDate: string;

  @ValidateNested({ each: true })
  @Type(() => ScheduledCourseDto)
  scheduledCourses: ScheduledCourseDto[];

  @IsInt()
  loadDifference: number;

  @IsInt()
  totalOriginalSessionsToSchedule: number;

  @IsNumber()
  solverDurationSeconds: number;

  @IsString()
  solverStatus: string;

  @IsString()
  solverMessage: string;
}
