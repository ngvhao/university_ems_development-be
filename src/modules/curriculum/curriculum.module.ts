import { Module, forwardRef } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumEntity } from './entities/curriculum.entity';
import { MajorModule } from '../major/major.module';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CurriculumEntity]),
    forwardRef(() => MajorModule),
    forwardRef(() => StudentModule),
  ],
  providers: [CurriculumService],
  controllers: [CurriculumController],
  exports: [CurriculumService],
})
export class CurriculumModule {}
