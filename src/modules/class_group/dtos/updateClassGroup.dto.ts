import { OmitType, PartialType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { CreateClassGroupDto } from './createClassGroup.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateClassWeeklyScheduleDto } from 'src/modules/class_weekly_schedule/dtos/updateClassWeeklySchedule.dto';

export class UpdateClassGroupDto extends OmitType(
  PartialType(CreateClassGroupDto),
  ['schedules'],
) {
  @ApiPropertyOptional({
    description:
      'Số lượng sinh viên đã đăng ký chính thức (chỉ dùng cho mục đích cập nhật cụ thể, thường được quản lý bởi logic đăng ký)',
    example: 45,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Min(0, { message: 'Số sinh viên đã đăng ký không được âm' })
  @IsNumber({}, { message: 'Số sinh viên đã đăng ký phải là số' })
  registeredStudents?: number;

  @ApiPropertyOptional({
    description:
      'Số lượng sinh viên đăng ký tạm thời/ưu tiên (ít dùng hơn, tùy logic nghiệp vụ)',
    example: 5,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Min(0, { message: 'Số sinh viên đăng ký tạm không được âm' })
  @IsNumber({}, { message: 'Số sinh viên đăng ký tạm phải là số' })
  preRegisteredStudents?: number;

  @ApiPropertyOptional({
    description: 'Lịch học của nhóm lớp',
    example: [],
    required: false,
  })
  @IsOptional()
  @IsArray()
  schedules?: UpdateClassWeeklyScheduleDto[];
}
