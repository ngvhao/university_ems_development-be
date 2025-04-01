import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { EEnrollmentStatus } from 'src/utils/enums/course.enum';

export class FilterEnrollmentCourseDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  studentId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  classGroupId?: number;

  @IsOptional()
  @IsEnum(EEnrollmentStatus)
  status?: EEnrollmentStatus;
}
