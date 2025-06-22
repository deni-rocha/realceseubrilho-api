import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Order } from '@/order/entities/order.entity';
import { OrderService } from '@/order/order.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, OrderService])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
