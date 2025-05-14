import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

export class FilterLecturerCourseDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID Giảng viên',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'ID Giảng viên phải là số nguyên' })
  @IsPositive({ message: 'ID Giảng viên phải là số dương' })
  @Type(() => Number)
  lecturerId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Học phần',
    example: 101,
  })
  @IsOptional()
  @IsInt({ message: 'ID Học phần phải là số nguyên' })
  @IsPositive({ message: 'ID Học phần phải là số dương' })
  @Type(() => Number)
  courseId?: number;
}
