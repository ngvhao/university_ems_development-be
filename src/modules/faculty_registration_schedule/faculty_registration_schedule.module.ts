import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyRegistrationScheduleEntity } from './entities/faculty_registration_schedule.entity';
import { FacultyRegistrationScheduleController } from './faculty_registration_schedule.controller';
import { FacultyRegistrationScheduleService } from './faculty_registration_schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([FacultyRegistrationScheduleEntity])],
  controllers: [FacultyRegistrationScheduleController],
  providers: [FacultyRegistrationScheduleService],
  exports: [FacultyRegistrationScheduleService],
})
export class FacultyRegistrationScheduleModule {}
