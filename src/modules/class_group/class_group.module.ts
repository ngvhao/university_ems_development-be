import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassGroupService } from './class_group.service';
import { ClassGroupController } from './class_group.controller';
import { ClassGroupEntity } from './entities/class_group.entity';
import { CourseSemesterModule } from 'src/modules/course_semester/course_semester.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassGroupEntity]),
    forwardRef(() => CourseSemesterModule),
  ],
  controllers: [ClassGroupController],
  providers: [ClassGroupService],
  exports: [ClassGroupService],
})
export class ClassGroupModule {}
