import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class UpdateClassGroupStatusDto {
  @IsNotEmpty()
  @IsEnum(EClassGroupStatus)
  @ApiProperty()
  status: EClassGroupStatus;
}
