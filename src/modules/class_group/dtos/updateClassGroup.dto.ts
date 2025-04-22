import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { CreateClassGroupDto } from './createClassGroup.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClassGroupDto extends PartialType(CreateClassGroupDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  registeredStudents?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  preRegisteredStudents?: number;
}
