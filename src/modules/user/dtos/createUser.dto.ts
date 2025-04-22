import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EUserRole, EUserStatus } from 'src/utils/enums/user.enum';
import { PASSWORD_VALID_REGEX, PHONE_NUMBER_REGEX } from 'src/utils/constants';

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  personal_email: string;

  @IsNotEmpty()
  @Matches(PASSWORD_VALID_REGEX, {
    message:
      'Password must be at least 8 characters long, contain at least one uppercase letter, one special character, and one digit.',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(EUserRole)
  role?: EUserRole = EUserRole.STUDENT;

  @IsOptional()
  @IsEnum(EUserStatus)
  status: EUserStatus = EUserStatus.ACTIVE;

  @IsOptional()
  @Matches(PHONE_NUMBER_REGEX, { message: 'Phonenumber is not valid' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  identityCardNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Date of birth is not valid' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  hometown?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsString()
  temporaryAddress?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  ethnicity?: string;
}
