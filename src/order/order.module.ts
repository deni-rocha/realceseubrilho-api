import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { UsersService } from '@/users/users.service';
import { ProductService } from '@/product/product.service';
import { ShoppingCartService } from '@/shopping-cart/shopping-cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      UsersService,
      ProductService,
      ShoppingCartService,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
