import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { AreDatesValid } from 'src/decorators/faculty-dates-registration.decorator';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';

@AreDatesValid()
export class CreateFacultyRegistrationScheduleDto {
  @ApiProperty({ description: 'ID của Khoa', example: 1, type: Number })
  @IsPositive({ message: 'ID Khoa phải là số dương' })
  @IsNotEmpty({ message: 'ID Khoa không được để trống' })
  facultyId: number;

  @ApiProperty({ description: 'ID của Học kỳ', example: 5, type: Number })
  @IsPositive({ message: 'ID Học kỳ phải là số dương' })
  @IsNotEmpty({ message: 'ID Học kỳ không được để trống' })
  semesterId: number;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu đăng ký nguyện vọng (YYYY-MM-DD HH:MM:SS)',
    example: '2024-08-01 08:00:00',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Ngày giờ bắt đầu ĐK nguyện vọng không hợp lệ' })
  @IsNotEmpty({
    message: 'Ngày giờ bắt đầu ĐK nguyện vọng không được để trống',
  })
  preRegistrationStartDate: string;

  @ApiProperty({
    description: 'Ngày giờ kết thúc đăng ký nguyện vọng (YYYY-MM-DD HH:MM:SS)',
    example: '2024-08-10 17:00:00',
    type: String,
    format: 'date-time',
  })
  @IsDateString(
    {},
    { message: 'Ngày giờ kết thúc ĐK nguyện vọng không hợp lệ' },
  )
  @IsNotEmpty({
    message: 'Ngày giờ kết thúc ĐK nguyện vọng không được để trống',
  })
  preRegistrationEndDate: string;

  @ApiProperty({
    description: 'Ngày giờ bắt đầu đăng ký chính thức (YYYY-MM-DD HH:MM:SS)',
    example: '2024-08-15 08:00:00',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Ngày giờ bắt đầu ĐK chính thức không hợp lệ' })
  @IsNotEmpty({ message: 'Ngày giờ bắt đầu ĐK chính thức không được để trống' })
  registrationStartDate: string;

  @ApiProperty({
    description: 'Ngày giờ kết thúc đăng ký chính thức (YYYY-MM-DD HH:MM:SS)',
    example: '2024-08-25 17:00:00',
    type: String,
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Ngày giờ kết thúc ĐK chính thức không hợp lệ' })
  @IsNotEmpty({
    message: 'Ngày giờ kết thúc ĐK chính thức không được để trống',
  })
  registrationEndDate: string;

  @ApiPropertyOptional({
    description: 'Trạng thái ban đầu của lịch (mặc định: PENDING)',
    enum: EFacultyRegistrationScheduleStatus,
    example: EFacultyRegistrationScheduleStatus.PENDING,
    default: EFacultyRegistrationScheduleStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(EFacultyRegistrationScheduleStatus, {
    message: 'Trạng thái không hợp lệ',
  })
  status?: EFacultyRegistrationScheduleStatus =
    EFacultyRegistrationScheduleStatus.PENDING;
}
