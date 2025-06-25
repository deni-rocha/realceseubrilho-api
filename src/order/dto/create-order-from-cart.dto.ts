import { PaymentMethod } from '@/payment/payment.method';
import { IsString } from 'class-validator';

export class CreateOrderFromCartDto {
  @IsString()
  userId: string;

  @IsString()
  shippingAddress: string;

  @IsString()
  paymentMethod: PaymentMethod;
}
