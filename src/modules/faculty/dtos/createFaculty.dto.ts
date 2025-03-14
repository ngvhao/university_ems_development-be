import { IsString, IsOptional } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  facultyCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
