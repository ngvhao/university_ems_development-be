import { IsOptional, IsString, IsNumber, IsPositive } from 'class-validator';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';

export class FilterStudentDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  classId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  majorId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  academicYear?: number;
}
