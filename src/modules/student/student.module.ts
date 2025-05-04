import { forwardRef, Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { ClassModule } from '../class/class.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from './entities/student.entity';
import { UserModule } from '../user/user.module';
import { QueueModule } from 'src/common/queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentEntity]),
    forwardRef(() => ClassModule),
    UserModule,
    QueueModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
