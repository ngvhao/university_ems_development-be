import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateCurriculumCourseDto {
  @IsOptional()
  @IsInt()
  curriculumId?: number;

  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsInt()
  semesterId?: number;

  @IsOptional()
  @IsInt()
  minGradeRequired?: number;
}
