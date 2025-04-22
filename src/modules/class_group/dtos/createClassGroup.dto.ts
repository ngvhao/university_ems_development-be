import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class CreateClassGroupDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  courseSemesterId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @ApiProperty()
  groupNumber: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @ApiProperty()
  maxStudents: number;

  @IsOptional()
  @IsEnum(EClassGroupStatus)
  @ApiProperty()
  status?: EClassGroupStatus;
}
