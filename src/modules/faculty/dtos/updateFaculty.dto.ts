import { IsString, IsOptional } from 'class-validator';

export class UpdateFacultyDto {
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
