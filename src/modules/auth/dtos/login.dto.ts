import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  userCode: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
