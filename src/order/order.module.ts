import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { User } from '@/users/entities/user.entity';
import { Product } from '@/product/entities/product.entity';
import { Payment } from '@/payment/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product, Payment])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
