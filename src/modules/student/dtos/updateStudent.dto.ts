import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './createStudent.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsOptional()
  @IsNumber()
  gpa?: number;
}
