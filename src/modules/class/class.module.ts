import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { ClassEntity } from './entities/class.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MajorModule } from '../major/major.module';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity]), MajorModule],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
