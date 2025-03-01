import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsDate } from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dtos/createUser.dto';

export class CreateStudentDto extends CreateUserDto {
  @IsInt()
  @IsNotEmpty()
  academicYear: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  enrollmentDate: Date;

  @Type(() => Date)
  @IsDate()
  expectedGraduationDate?: Date;

  @IsInt()
  @IsNotEmpty()
  classId: number;
}
