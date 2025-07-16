import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { AddProductToCartDto } from '../cart-item/dto/add-product-to-cart.dto';
import { UpdateCartItemQuantityDto } from '../cart-item/dto/update-cart-item-quantity.dto';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { UserRole } from '@/role/role.enum';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Get('user/:userId')
  async findOrCreateCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.shoppingCartService.findOrCreateCart(userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Get(':cartId')
  async getCartDetails(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    return this.shoppingCartService.getCartDetails(cartId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Post(':cartId/items')
  async addProduct(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Body() addProductDto: AddProductToCartDto,
  ) {
    return this.shoppingCartService.addProduct(
      cartId,
      addProductDto.productId,
      addProductDto.quantity,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Patch(':cartId/items/:productId')
  async updateProductQuantity(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() updateQuantityDto: UpdateCartItemQuantityDto,
  ) {
    return this.shoppingCartService.updateProductQuantity(
      cartId,
      productId,
      updateQuantityDto.quantity,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Delete(':cartId/items/:productId')
  async removeProduct(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    await this.shoppingCartService.removeProduct(cartId, productId);
    return { message: 'Produto removido do carrinho.' };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @Delete(':cartId/items')
  async clearCart(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    await this.shoppingCartService.clearCart(cartId);
    return { message: 'Carrinho esvaziado com sucesso.' };
  }

  @Get(':cartId/total')
  async calculateCartTotal(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
  ) {
    const total = await this.shoppingCartService.calculateCartTotal(cartId);
    return { total };
  }
}
