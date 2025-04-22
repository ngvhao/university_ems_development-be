// src/faculty-registration-schedule/dtos/create-faculty-registration-schedule.dto.ts
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { AreDatesValid } from 'src/decorators/faculty-dates-registration.decorator';
import { EFacultyRegistrationScheduleStatus } from 'src/utils/enums/faculty.enum';

@AreDatesValid()
export class CreateFacultyRegistrationScheduleDto {
  @IsNotEmpty({ message: 'Faculty ID không được để trống' })
  @IsNumber({}, { message: 'Faculty ID phải là số' })
  facultyId: number;

  @IsNotEmpty({ message: 'Semester ID không được để trống' })
  @IsNumber({}, { message: 'Semester ID phải là số' })
  semesterId: number;

  @IsNotEmpty({ message: 'Ngày bắt đầu đăng ký trước không được để trống' })
  @IsDateString({}, { message: 'Ngày bắt đầu đăng ký trước không hợp lệ' })
  preRegistrationStartDate: Date;

  @IsNotEmpty({ message: 'Ngày kết thúc đăng ký trước không được để trống' })
  @IsDateString({}, { message: 'Ngày kết thúc đăng ký trước không hợp lệ' })
  preRegistrationEndDate: Date;

  @IsNotEmpty({
    message: 'Ngày bắt đầu đăng ký chính thức không được để trống',
  })
  @IsDateString({}, { message: 'Ngày bắt đầu đăng ký chính thức không hợp lệ' })
  registrationStartDate: Date;

  @IsNotEmpty({
    message: 'Ngày kết thúc đăng ký chính thức không được để trống',
  })
  @IsDateString(
    {},
    { message: 'Ngày kết thúc đăng ký chính thức không hợp lệ' },
  )
  registrationEndDate: Date;

  @IsOptional()
  @IsEnum(EFacultyRegistrationScheduleStatus, {
    message: 'Trạng thái không hợp lệ',
  })
  status?: EFacultyRegistrationScheduleStatus;
}
