import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeSlotDto } from './createTimeSlot.dto';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {}
