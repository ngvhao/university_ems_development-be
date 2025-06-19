import { PartialType } from '@nestjs/swagger';
import { CreateNotificationDto } from './createNotification.dto';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {}
