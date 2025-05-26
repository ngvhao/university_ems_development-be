import { Module } from '@nestjs/common';
import { TuitionController } from './tuition.controller';
import { TuitionService } from './tuition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuitionEntity } from './entities/tuition.entity';
import { StudentModule } from '../student/student.module';
import { SemesterModule } from '../semester/semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TuitionEntity]),
    StudentModule,
    SemesterModule,
  ],
  controllers: [TuitionController],
  providers: [TuitionService],
  exports: [TuitionService],
})
export class TuitionModule {}
