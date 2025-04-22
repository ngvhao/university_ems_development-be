import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  userCode: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
