import { PartialType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { CreateStudentDto } from './createStudent.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PASSWORD_VALID_REGEX } from 'src/utils/constants';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({
    description: 'Điểm trung bình tích lũy (GPA)',
    example: 3.5,
    minimum: 0,
    maximum: 4.0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'GPA phải là số' })
  @Min(0, { message: 'GPA không được âm' })
  @Max(4.0)
  gpa?: number;

  @IsOptional()
  @IsNotEmpty()
  @Matches(PASSWORD_VALID_REGEX, {
    message:
      'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
  })
  password?: string;
}
