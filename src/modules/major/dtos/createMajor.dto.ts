import { IsString, IsInt, IsNotEmpty, Min, MaxLength } from 'class-validator';

export class CreateMajorDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsInt({ message: 'Department ID must be an integer' })
  @Min(1, { message: 'Department ID must be greater than 0' })
  @IsNotEmpty({ message: 'Department ID is required' })
  departmentId: number;
}
