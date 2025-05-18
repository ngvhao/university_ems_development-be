import { Type } from 'class-transformer';
import { IsInt, ValidateNested } from 'class-validator';
import { ScheduledClassGroupDto } from './scheduledClassGroup.dto';

export class ScheduledCourseDto {
  @IsInt()
  courseId: number;

  @IsInt()
  totalRegisteredStudents: number;

  @IsInt()
  totalSessionsForCourse: number;

  @ValidateNested({ each: true })
  @Type(() => ScheduledClassGroupDto)
  scheduledClassGroups: ScheduledClassGroupDto[];
}
