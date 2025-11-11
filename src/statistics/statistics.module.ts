import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Order } from '@/order/entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { User } from '@/users/entities/user.entity';
import { ExpenseModule } from '@/expense/expense.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    ExpenseModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}
