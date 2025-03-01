import { Module } from '@nestjs/common';
import { FalcutyController } from './falcuty.controller';
import { FalcutyService } from './falcuty.service';

@Module({
  controllers: [FalcutyController],
  providers: [FalcutyService],
})
export class FalcutyModule {}
