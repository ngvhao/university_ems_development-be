import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

export class FilterCourseFacultyDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc theo ID môn học',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID môn học phải là số nguyên' })
  @Min(1, { message: 'ID môn học phải lớn hơn 0' })
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo ID khoa',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID khoa phải là số nguyên' })
  @Min(1, { message: 'ID khoa phải lớn hơn 0' })
  facultyId?: number;

  @ApiPropertyOptional({
    description: 'Lọc theo môn học chính của khoa',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;
}
