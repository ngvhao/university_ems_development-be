import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { Type } from 'class-transformer';

export class FilterStudentDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (Tên, Họ, Email, Mã sinh viên)',
    example: 'Văn A',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Lớp sinh hoạt',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID Lớp phải là số' })
  @IsPositive({ message: 'ID Lớp phải là số dương' })
  @Type(() => Number)
  classId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Chuyên ngành',
    example: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID Chuyên ngành phải là số' })
  @IsPositive({ message: 'ID Chuyên ngành phải là số dương' })
  @Type(() => Number)
  majorId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo Khóa học (Năm nhập học)',
    example: 2024,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Khóa học phải là số' })
  @IsPositive({ message: 'Khóa học phải là số dương' })
  @Type(() => Number)
  academicYear?: number;
}
