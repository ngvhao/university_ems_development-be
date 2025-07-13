import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterLecturerDto {
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
    description: 'Trạng thái giảng viên',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
