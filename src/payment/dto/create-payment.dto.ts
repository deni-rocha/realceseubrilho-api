import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '../payment.method';

export class CreatePaymentDto {
    @IsString()
    orderId: string;

    @IsNumber()
    amount: number;

    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @IsOptional()
    @IsString()
    transactionId?: string;
}
