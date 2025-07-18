import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsPositive,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { CreateUserDto } from 'src/modules/user/dtos/createUser.dto';
import { EAcademicRank } from 'src/utils/enums/user.enum';

export class CreateLecturerDto extends OmitType(CreateUserDto, [
  'role',
] as const) {
  @ApiProperty({
    description: 'ID của Khoa/Bộ môn mà Giảng viên thuộc về',
    example: 5,
    type: Number,
  })
  @IsPositive({ message: 'ID Khoa/Bộ môn phải là số dương' })
  @IsNotEmpty({ message: 'ID Khoa/Bộ môn không được để trống' })
  departmentId: number;

  @ApiPropertyOptional({
    description: 'Học hàm/Học vị (ví dụ: ThS, TS, PGS, GS)',
    example: EAcademicRank.MASTER,
    enum: EAcademicRank,
  })
  @IsOptional()
  @IsEnum(EAcademicRank, {
    message: 'Học hàm/Học vị phải là một trong các giá trị: ThS, TS, PGS, GS',
  })
  academicRank?: EAcademicRank;

  @ApiPropertyOptional({
    description: 'Chuyên ngành chính',
    example: 'Khoa học Máy tính',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Chuyên ngành phải là chuỗi' })
  @MaxLength(255, { message: 'Chuyên ngành không được vượt quá 255 ký tự' })
  specialization?: string;

  @ApiPropertyOptional({
    description: 'Đánh dấu là Trưởng bộ môn? (Chỉ một người/bộ môn)',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trường isHeadOfFaculty phải là true/false' })
  isHeadOfFaculty?: boolean = false;
}
