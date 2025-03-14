import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  courseCode: string;

  @IsString()
  name: string;

  @IsInt()
  credit: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  majorId: number;

  @IsInt()
  @IsOptional()
  prerequisiteCourseId?: number;
}
