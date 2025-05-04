import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacultyRegistrationScheduleEntity } from './entities/faculty_registration_schedule.entity';
import { FacultyRegistrationScheduleController } from './faculty_registration_schedule.controller';
import { FacultyRegistrationScheduleService } from './faculty_registration_schedule.service';
import { FacultyModule } from '../faculty/faculty.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacultyRegistrationScheduleEntity]),
    forwardRef(() => FacultyModule),
    forwardRef(() => SemesterModule),
  ],
  controllers: [FacultyRegistrationScheduleController],
  providers: [FacultyRegistrationScheduleService],
  exports: [FacultyRegistrationScheduleService],
})
export class FacultyRegistrationScheduleModule {}
