import { Module } from '@nestjs/common';
import { LecturerService } from './lecturer.service';
import { LecturerController } from './lecturer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturerEntity } from './entities/lecturer.entity';
import { ClassEntity } from '../class/entities/class.entity';
import { ClassGroupEntity } from '../class_group/entities/class_group.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LecturerEntity, ClassEntity, ClassGroupEntity]),
    UserModule,
  ],
  providers: [LecturerService],
  controllers: [LecturerController],
  exports: [LecturerService],
})
export class LecturerModule {}
