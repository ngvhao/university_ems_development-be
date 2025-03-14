import { IsString, IsInt, IsOptional } from 'class-validator';

export class UpdateMajorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;
}
