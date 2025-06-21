import { Controller, Get, Post, Patch, Delete, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { AddProductToCartDto } from '../cart-item/dto/add-product-to-cart.dto';
import { UpdateCartItemQuantityDto } from '../cart-item/dto/update-cart-item-quantity.dto';

@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @Get('user/:userId')
  async findOrCreateCart(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return this.shoppingCartService.findOrCreateCart(userId);
  }

  @Get(':cartId')
  async getCartDetails(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    return this.shoppingCartService.getCartDetails(cartId);
  }

  @Post(':cartId/items')
  async addProduct(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Body() addProductDto: AddProductToCartDto,
  ) {
    return this.shoppingCartService.addProduct(cartId, addProductDto.productId, addProductDto.quantity);
  }

  @Patch(':cartId/items/:productId')
  async updateProductQuantity(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Body() updateQuantityDto: UpdateCartItemQuantityDto,
  ) {
    return this.shoppingCartService.updateProductQuantity(cartId, productId, updateQuantityDto.quantity);
  }

  @Delete(':cartId/items/:productId')
  async removeProduct(
    @Param('cartId', new ParseUUIDPipe()) cartId: string,
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ) {
    await this.shoppingCartService.removeProduct(cartId, productId);
    return { message: 'Produto removido do carrinho.' };
  }

  @Delete(':cartId/items')
  async clearCart(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    await this.shoppingCartService.clearCart(cartId);
    return { message: 'Carrinho esvaziado com sucesso.' };
  }

  @Get(':cartId/total')
  async calculateCartTotal(@Param('cartId', new ParseUUIDPipe()) cartId: string) {
    const total = await this.shoppingCartService.calculateCartTotal(cartId);
    return { total };
  }
}
