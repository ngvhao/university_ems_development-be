import { Module } from '@nestjs/common';
import { SemesterController } from './semester.controller';
import { SemesterService } from './semester.service';
import { SemesterEntity } from './entities/semester.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SemesterEntity])],
  controllers: [SemesterController],
  providers: [SemesterService],
})
export class SemesterModule {}
