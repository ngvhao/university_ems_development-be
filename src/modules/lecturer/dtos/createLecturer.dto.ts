import { IsInt, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dtos/createUser.dto';

export class CreateLecturerDto extends CreateUserDto {
  @IsInt()
  userId: number;

  @IsInt()
  departmentId: number;

  @IsOptional()
  @IsString()
  academicRank?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
