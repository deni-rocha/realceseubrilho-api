import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { UsersModule } from '@/users/users.module';
import { ProductModule } from '@/product/product.module';
import { ShoppingCartModule } from '@/shopping-cart/shopping-cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    UsersModule,
    ProductModule,
    ShoppingCartModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
