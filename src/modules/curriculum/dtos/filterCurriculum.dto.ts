import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCurriculumDto {
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
    description: 'Năm bắt đầu chương trình đào tạo',
    example: 2020,
  })
  @IsOptional()
  @IsNumber()
  startAcademicYear?: number;
}
