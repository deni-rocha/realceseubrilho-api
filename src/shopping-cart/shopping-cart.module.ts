import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { UsersModule } from '@/users/users.module';
import { ProductModule } from '@/product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingCart, CartItem]),
    UsersModule,
    ProductModule,
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
  exports: [ShoppingCartService],
})
export class ShoppingCartModule {}
