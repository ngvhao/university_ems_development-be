import { Module } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumEntity } from './entities/curriculum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurriculumEntity])],
  providers: [CurriculumService],
  controllers: [CurriculumController],
})
export class CurriculumModule {}
