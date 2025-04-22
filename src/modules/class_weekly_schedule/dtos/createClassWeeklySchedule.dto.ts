import { IsInt } from 'class-validator';

export class CreateClassWeeklyScheduleDto {
  @IsInt({ message: 'classGroupId must be an integer' })
  classGroupId: number;

  @IsInt({ message: 'roomId must be an integer' })
  roomId: number;

  @IsInt({ message: 'timeSlotId must be an integer' })
  timeSlotId: number;

  @IsInt({ message: 'dayOfWeek must be an integer (0=Sun, 6=Sat)' })
  dayOfWeek: number;
}
