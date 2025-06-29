import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductService } from '../product/product.service';
import { ShoppingCart } from './entities/shopping-cart.entity';
import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { UsersService } from '@/users/users.service';
import Decimal from 'decimal.js';

@Injectable()
export class ShoppingCartService {
  constructor(
    @InjectRepository(ShoppingCart)
    private readonly shoppingCartRepository: Repository<ShoppingCart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly userService: UsersService,
    private readonly productService: ProductService,
  ) {}

  async findOrCreateCart(userId: string): Promise<ShoppingCart> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID "${userId}" não encontrado.`);
    }

    let cart = await this.shoppingCartRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!cart) {
      cart = this.shoppingCartRepository.create({ user });
      await this.shoppingCartRepository.save(cart);
    }
    return this.getCartDetails(cart.id);
  }

  async getCartDetails(cartId: string): Promise<ShoppingCart> {
    const cart = await this.shoppingCartRepository.findOne({
      where: { id: cartId },
      relations: ['cartItems', 'cartItems.product', 'user'],
    });
    if (!cart) {
      throw new NotFoundException(
        `Carrinho de compras com ID "${cartId}" não encontrado.`,
      );
    }
    return cart;
  }

  async addProduct(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException(
        'A quantidade deve ser um número positivo.',
      );
    }

    const cart = await this.getCartDetails(cartId);
    const product = await this.productService.findOne(productId);

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stockQuantity}`,
      );
    }

    let cartItem = cart.cartItems.find((item) => item.product.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.unitPrice = product.price;
      cartItem.subtotal = new Decimal(cartItem.quantity)
        .mul(cartItem.unitPrice)
        .toFixed(2);
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        unitPrice: product.price,
        subtotal: new Decimal(product.price).mul(quantity).toFixed(2),
      });
      await this.cartItemRepository.save(cartItem);
    }
    return cartItem;
  }

  async removeProduct(cartId: string, productId: string): Promise<void> {
    const cart = await this.getCartDetails(cartId);
    const cartItem = cart.cartItems.find(
      (item) => item.product.id === productId,
    );

    if (!cartItem) {
      throw new NotFoundException(
        `Produto com ID "${productId}" não encontrado no carrinho.`,
      );
    }

    await this.cartItemRepository.remove(cartItem);
  }

  async updateProductQuantity(
    cartId: string,
    productId: string,
    newQuantity: number,
  ): Promise<CartItem | null> {
    if (newQuantity <= 0) {
      await this.removeProduct(cartId, productId);
      return null;
    }

    const cart = await this.getCartDetails(cartId);
    let cartItem = cart.cartItems.find((item) => item.product.id === productId);

    if (!cartItem) {
      throw new NotFoundException(
        `Produto com ID "${productId}" não encontrado no carrinho.`,
      );
    }

    const product = await this.productService.findOne(productId);

    if (product.stockQuantity < newQuantity) {
      throw new BadRequestException(
        `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stockQuantity}. Solicitado: ${newQuantity}`,
      );
    }

    cartItem.quantity = newQuantity;
    cartItem.unitPrice = product.price;
    cartItem.subtotal = new Decimal(cartItem.quantity)
      .mul(cartItem.unitPrice)
      .toFixed(2);
    return this.cartItemRepository.save(cartItem);
  }

  async clearCart(cartId: string): Promise<void> {
    const cart = await this.getCartDetails(cartId);
    await this.cartItemRepository.remove(cart.cartItems);
  }

  async calculateCartTotal(cartId: string): Promise<string> {
    const cart = await this.getCartDetails(cartId);
    const total = cart.cartItems.reduce(
      (sum, item) => sum.plus(new Decimal(item.subtotal)),
      new Decimal(0),
    );
    return total.toFixed(2);
  }
}
