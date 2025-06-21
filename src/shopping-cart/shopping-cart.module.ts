import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { User } from '@/users/entities/user.entity';
import { Product } from '@/product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCart, CartItem, User, Product])],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
