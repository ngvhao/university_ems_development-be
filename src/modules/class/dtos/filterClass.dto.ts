import { IsOptional, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterClassDto {
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
    description: 'Năm nhập học',
    example: 2024,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  yearOfAdmission?: number;

  @ApiPropertyOptional({
    description: 'ID của giảng viên chủ nhiệm',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  homeroomLecturerId?: number;
}
