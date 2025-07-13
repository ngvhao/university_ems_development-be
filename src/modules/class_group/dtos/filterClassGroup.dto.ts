import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterClassGroupDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID khoa',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID bộ môn',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID ngành học',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  majorId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID môn học',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID học kỳ',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  semesterId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo danh sách trạng thái',
    example: ['ACTIVE', 'INACTIVE'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statuses?: string[];

  @ApiPropertyOptional({
    description: 'Lọc theo năm nhập học',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearAdmission?: number;
}
