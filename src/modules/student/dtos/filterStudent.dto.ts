import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterStudentDto {
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
    description: 'ID của lớp học',
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  classId?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái sinh viên',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
