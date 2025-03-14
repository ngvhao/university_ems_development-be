import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  courseCode?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  credit?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  majorId?: number;

  @IsInt()
  @IsOptional()
  prerequisiteCourseId?: number;
}
