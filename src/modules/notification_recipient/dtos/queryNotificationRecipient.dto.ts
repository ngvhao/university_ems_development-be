import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import { ERecipientStatus } from 'src/utils/enums/notification.enum';

export class UserNotificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đọc (UNREAD, READ, DISMISSED)',
    enum: ERecipientStatus,
    example: ERecipientStatus.UNREAD,
  })
  @IsOptional()
  @IsEnum(ERecipientStatus, { message: 'Trạng thái không hợp lệ.' })
  status?: ERecipientStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo thông báo đã ghim',
    type: Boolean,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'Giá trị isPinned phải là boolean.' })
  isPinned?: boolean;
}
