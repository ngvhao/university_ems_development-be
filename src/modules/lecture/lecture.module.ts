import { Module } from '@nestjs/common';
import { LecturerService } from './lecture.service';
import { LecturerController } from './lecture.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturerEntity } from './entities/lecture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LecturerEntity])],
  providers: [LecturerService],
  controllers: [LecturerController],
})
export class LectureModule {}
