import { IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class CreateClassGroupDto {
  @IsNotEmpty()
  @IsNumber()
  courseSemesterId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  groupNumber: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxStudents: number;

  @IsOptional()
  @IsEnum(EClassGroupStatus)
  status?: EClassGroupStatus;
}
