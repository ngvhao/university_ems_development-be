import { forwardRef, Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassEntity } from './entities/class.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorModule } from '../major/major.module';
import { StudentModule } from '../student/student.module';
import { LecturerModule } from '../lecturer/lecturer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassEntity]),
    forwardRef(() => MajorModule),
    forwardRef(() => StudentModule),
    LecturerModule,
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
