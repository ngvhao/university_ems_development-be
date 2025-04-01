import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class FilterClassGroupDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  courseSemesterId?: number;

  @IsOptional()
  @IsEnum(EClassGroupStatus)
  status?: EClassGroupStatus;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  groupNumber?: number;
}
