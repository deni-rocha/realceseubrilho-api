import { Module } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { ShoppingCartController } from './shopping-cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { UsersService } from '@/users/users.service';
import { ProductService } from '@/product/product.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingCart, CartItem, UsersService, ProductService])],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService],
})
export class ShoppingCartModule {}
