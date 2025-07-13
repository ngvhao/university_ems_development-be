import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCourseDto {
  @ApiPropertyOptional({
    description: 'ID của khoa',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'ID của bộ môn',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'ID của ngành học',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  majorId?: number;

  @ApiPropertyOptional({
    description: 'ID của chương trình đào tạo',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  curriculumId?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái môn học',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}

export class FilterClassGroupDto {
  @ApiPropertyOptional({
    description: 'ID của môn học',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({
    description: 'ID của học kỳ',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'ID của khoa',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  facultyId?: number;
}
