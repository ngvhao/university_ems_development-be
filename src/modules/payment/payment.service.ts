import { Injectable } from '@nestjs/common';
import { PaymentTransactionService } from '../payment_transaction/payment_transaction.service';
import {
  EPaymentGateway,
  EPaymentSuccessStatusCode,
} from 'src/utils/enums/payment.enum';
import { EPaymentTransactionStatus } from 'src/utils/enums/tuition.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentTransactionService: PaymentTransactionService,
  ) {}

  async processPayment(
    status: string,
    transactionId: number,
    paymentType: EPaymentGateway,
    transId: string,
  ): Promise<void> {
    console.log(
      'processPayment@@EPaymentSuccessStatusCode[paymentType]: ',
      EPaymentSuccessStatusCode[paymentType],
    );
    if (status == EPaymentSuccessStatusCode[paymentType]) {
      await this.paymentTransactionService.update(transactionId, {
        status: EPaymentTransactionStatus.SUCCESS,
        paymentDate: new Date(),
        transId: transId,
      });
      console.log(
        '[Thanh toán học phí thành công] processPayment@@status:',
        status,
      );
    } else {
      await this.paymentTransactionService.update(transactionId, {
        status: EPaymentTransactionStatus.FAILED,
        failStatus: status,
        transId: transId,
      });
      console.log(
        '[Thanh toán học phí thất bại] processPayment@@status:',
        status,
      );
    }
  }
}
