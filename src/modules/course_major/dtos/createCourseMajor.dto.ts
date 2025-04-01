import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseMajorDto {
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @IsNotEmpty()
  @IsNumber()
  majorId: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}
