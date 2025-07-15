import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsBoolean,
} from 'class-validator';
import { UpdateUserDto } from 'src/modules/user/dtos/updateUser.dto';

export class UpdateLecturerDto extends PartialType(UpdateUserDto) {
  @ApiPropertyOptional({
    description: 'ID của Khoa/Bộ môn mới',
    example: 6,
    type: Number,
  })
  @IsOptional()
  @IsPositive({ message: 'ID Khoa/Bộ môn phải là số dương' })
  departmentId?: number;

  @ApiPropertyOptional({
    description: 'Học hàm/Học vị mới',
    example: 'TS',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Học hàm/Học vị phải là chuỗi' })
  @MaxLength(50, { message: 'Học hàm/Học vị không được vượt quá 50 ký tự' })
  academicRank?: string;

  @ApiPropertyOptional({
    description: 'Chuyên ngành mới',
    example: 'An toàn Thông tin',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  @MaxLength(255, { message: 'Chuyên ngành không được vượt quá 255 ký tự' })
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Cập nhật trạng thái Trưởng bộ môn (Chỉ một người/bộ môn)',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trường isHeadDepartment phải là true/false' })
  isHeadDepartment?: boolean;
}
