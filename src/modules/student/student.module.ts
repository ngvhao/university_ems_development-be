import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ClassModule } from '../class/class.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentEntity]),
    forwardRef(() => ClassModule),
    forwardRef(() =>
      import('../grade_detail/grade_detail.module').then(
        (m) => m.GradeDetailModule,
      ),
    ),
    UserModule,
    // QueueModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
