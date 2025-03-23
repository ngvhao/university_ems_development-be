import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlanEntity } from './entities/study_plan.entity';
import { StudyPlanController } from './study_plan.controller';
import { StudyPlanService } from './study_plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlanEntity])],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
  exports: [StudyPlanService],
})
export class StudyPlanModule {}
