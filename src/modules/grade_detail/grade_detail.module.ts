import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeDetailService } from './grade_detail.service';
import { GradeDetailController } from './grade_detail.controller';
import { GradeDetailEntity } from './entities/grade_detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GradeDetailEntity])],
  controllers: [GradeDetailController],
  providers: [GradeDetailService],
  exports: [GradeDetailService],
})
export class GradeDetailModule {}
