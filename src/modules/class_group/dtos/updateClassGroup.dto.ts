import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateClassGroupDto } from './createClassGroup.dto';

export class UpdateClassGroupDto extends PartialType(CreateClassGroupDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  registeredStudents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  preRegisteredStudents?: number;
}
