import { IsEnum } from "class-validator";
import { OrderStatus } from "../order-status.enum";

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus, {
        message: 'Status inválido. Use um dos seguintes: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELED.'
    })
    newStatus: OrderStatus;
}
