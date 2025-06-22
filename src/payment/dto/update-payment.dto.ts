import { IsEnum } from "class-validator";
import { PaymentStatus } from "../payment-status.enum";


export class UpdatePaymentDto {
    @IsEnum(PaymentStatus)
    newStatus: PaymentStatus;
}
