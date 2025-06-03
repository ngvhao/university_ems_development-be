import { forwardRef, Module } from '@nestjs/common';
import { PaymentTransactionService } from './payment_transaction.service';
import { PaymentTransactionController } from './payment_transaction.controller';
import { PaymentTransactionEntity } from './entities/payment_transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TuitionModule } from '../tuition/tuition.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentTransactionEntity]),
    forwardRef(() => TuitionModule),
    UserModule,
  ],
  providers: [PaymentTransactionService],
  controllers: [PaymentTransactionController],
  exports: [PaymentTransactionService],
})
export class PaymentTransactionModule {}
