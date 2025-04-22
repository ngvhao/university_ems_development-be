import { Module } from '@nestjs/common';
import { TimeSlotsController } from './time_slots.controller';
import { TimeSlotsService } from './time_slots.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeSlotsEntity } from './entities/time_slots.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeSlotsEntity])],
  controllers: [TimeSlotsController],
  providers: [TimeSlotsService],
  exports: [TimeSlotsService],
})
export class TimeSlotsModule {}
