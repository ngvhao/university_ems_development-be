import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

export class FilterMajorDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (Tên, Mã)',
    example: 'Công nghệ thông tin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID Khoa',
    example: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID Khoa phải là số' })
  @IsPositive({ message: 'ID Khoa phải là số dương' })
  @Type(() => Number)
  facultyId?: number;
}
