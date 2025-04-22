import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreateFacultyDto } from './createFaculty.dto';

export class UpdateFacultyDto extends PartialType(CreateFacultyDto) {
  @IsOptional()
  @IsString()
  facultyCode?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
