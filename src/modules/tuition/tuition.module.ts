import { forwardRef, Module } from '@nestjs/common';
import { TuitionController } from './tuition.controller';
import { TuitionService } from './tuition.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuitionEntity } from './entities/tuition.entity';
import { StudentModule } from '../student/student.module';
import { SemesterModule } from '../semester/semester.module';
import { PaymentModule } from 'src/modules/payment/payment.module';
import { PaymentTransactionModule } from '../payment_transaction/payment_transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TuitionEntity]),
    StudentModule,
    SemesterModule,
    PaymentModule,
    forwardRef(() => PaymentTransactionModule),
  ],
  controllers: [TuitionController],
  providers: [TuitionService],
  exports: [TuitionService],
})
export class TuitionModule {}
