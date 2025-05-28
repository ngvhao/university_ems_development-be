import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { EPaymentGateway } from 'src/utils/enums/payment.enum';

export class PaymentProcessDto {
  @IsEnum(EPaymentGateway)
  @IsNotEmpty()
  paymentGateway: EPaymentGateway;

  @IsNotEmpty()
  @IsNumber()
  tuitionId: number;
}
