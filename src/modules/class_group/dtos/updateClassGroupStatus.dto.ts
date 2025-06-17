import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EClassGroupStatus } from 'src/utils/enums/class.enum';

export class UpdateClassGroupStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới cần cập nhật cho nhóm lớp',
    enum: EClassGroupStatus,
    example: EClassGroupStatus.CLOSED_FOR_REGISTER,
    required: true,
  })
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(EClassGroupStatus, { message: 'Trạng thái không hợp lệ' })
  status: EClassGroupStatus;
}
