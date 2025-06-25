import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from 'src/utils/dtos/pagination.dto';
import {
  ENotificationType,
  ENotificationPriority,
  ERecipientStatus,
} from 'src/utils/enums/notification.enum';

export class UserNotificationQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tiêu đề hoặc nội dung' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo loại thông báo',
    enum: ENotificationType,
  })
  @IsOptional()
  @IsEnum(ENotificationType)
  notificationType?: ENotificationType;

  @ApiPropertyOptional({
    description: 'Lọc theo mức độ ưu tiên',
    enum: ENotificationPriority,
  })
  @IsOptional()
  @IsEnum(ENotificationPriority)
  priority?: ENotificationPriority;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái đọc của người dùng',
    enum: ERecipientStatus,
  })
  @IsOptional()
  @IsEnum(ERecipientStatus)
  recipientStatus?: ERecipientStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo thông báo đã ghim',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPinned?: boolean;
}
