import { IsInt, IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from 'src/modules/user/dtos/updateUser.dto';

export class UpdateLecturerDto extends UpdateUserDto {
  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsString()
  academicRank?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
