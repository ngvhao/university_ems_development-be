import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsPositive,
} from 'class-validator';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class CreateClassGroupDto {
  @ApiProperty({
    description: 'ID của học phần trong học kỳ',
    example: 15,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID Học phần-Học kỳ phải là số dương' })
  @IsNotEmpty({ message: 'ID Học phần-Học kỳ không được để trống' })
  semesterId: number;

  @ApiProperty({
    description: 'ID của môn học trong học kỳ',
    example: 15,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'ID môn học phải là số dương' })
  @IsNotEmpty({ message: 'ID môn học không được để trống' })
  courseId: number;

  @ApiProperty({
    description:
      'Số thứ tự của nhóm lớp trong học phần-học kỳ (phải là duy nhất)',
    example: 1,
    required: true,
    type: Number,
    minimum: 1,
  })
  @IsPositive({ message: 'Số thứ tự nhóm phải là số dương' })
  @IsNotEmpty({ message: 'Số thứ tự nhóm không được để trống' })
  groupNumber: number;

  @ApiProperty({
    description: 'Số lượng sinh viên tối đa cho nhóm lớp',
    example: 60,
    required: true,
    type: Number,
    minimum: 0,
  })
  @Min(0, { message: 'Số lượng sinh viên tối đa không được âm' })
  @IsNumber({}, { message: 'Số lượng sinh viên tối đa phải là số' })
  @IsNotEmpty({ message: 'Số lượng sinh viên tối đa không được để trống' })
  maxStudents: number;

  @ApiProperty({
    description: 'Trạng thái ban đầu của nhóm lớp (mặc định là OPEN)',
    enum: EClassGroupStatus,
    example: EClassGroupStatus.OPEN,
    required: false,
    default: EClassGroupStatus.OPEN,
  })
  @IsOptional()
  @IsEnum(EClassGroupStatus, { message: 'Trạng thái không hợp lệ' })
  status?: EClassGroupStatus;
}
