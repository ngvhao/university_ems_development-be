import { IsInt, IsBoolean } from 'class-validator';

export class CreateCurriculumCourseDto {
  @IsInt()
  curriculumId: number;

  @IsInt()
  courseId: number;

  @IsBoolean()
  isMandatory: boolean;

  @IsInt()
  minCreditsRequired: number;

  @IsInt()
  semesterId: number;

  @IsInt()
  minGradeRequired: number;
}
