import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterMajorDto {
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
    description: 'Lọc theo trạng thái',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
