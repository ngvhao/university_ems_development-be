import { IsString, IsInt } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  departmentCode: string;

  @IsString()
  name: string;

  @IsInt()
  facultyId: number;
}
