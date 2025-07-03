import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { OrderStatus } from './order-status.enum';
import { ProductService } from '../product/product.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { Order } from './entities/order.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { Product } from '@/product/entities/product.entity';
import { UsersService } from '@/users/users.service';
import Decimal from 'decimal.js';
import { CreateOrderFromCartDto } from './dto/create-order-from-cart.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly usersService: UsersService,
    private readonly productService: ProductService,
    private readonly shoppingCartService: ShoppingCartService,
    private dataSource: DataSource,
  ) { }

  async createOrderFromCart(
    createOrderFromCartDto: CreateOrderFromCartDto,
  ): Promise<Order> {
    const { userId } = createOrderFromCartDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await this.usersService.findOne(userId);

      if (!user) {
        throw new NotFoundException(
          `Usuário com ID "${userId}" não encontrado`,
        );
      }

      const cartId = (await this.shoppingCartService.findOrCreateCart(userId))
        .id;
      const cart = await this.shoppingCartService.getCartDetails(cartId);

      if (!cart.cartItems || cart.cartItems.length === 0) {
        throw new BadRequestException(
          'Não é possível criar um pedido a partir de um carrinho vazio.',
        );
      }

      let totalAmount = new Decimal(0);
      const orderItems: OrderItem[] = [];

      // Verificar estoque e preparar orderItems
      for (const cartItem of cart.cartItems) {
        const product = await this.productService.findOne(cartItem.product.id);

        if (product.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stockQuantity}, Solicitado: ${cartItem.quantity}`,
          );
        }

        const unitPrice = new Decimal(product.price);
        const subtotal = unitPrice.mul(cartItem.quantity);

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = cartItem.quantity;
        orderItem.unitPrice = parseFloat(unitPrice.toFixed(2));
        orderItem.subtotal = parseFloat(subtotal.toFixed(2));

        orderItems.push(orderItem);
        totalAmount = totalAmount.plus(subtotal);

        // Atualizar estoque do produto
        product.stockQuantity -= cartItem.quantity;
        await queryRunner.manager.save(Product, product);
      }

      const newOrder = new Order();
      newOrder.user = user;
      newOrder.orderDate = new Date();
      newOrder.status = OrderStatus.PENDING;
      newOrder.totalAmount = parseFloat(totalAmount.toFixed(2));
      newOrder.shippingAddress = 'A combinar via WhatsApp';
      newOrder.paymentMethod = 'WHATSAPP';
      newOrder.orderItems = orderItems;

      const savedOrder = await queryRunner.manager.save(Order, newOrder);

      // Salvar os itens do pedido associados ao pedido
      for (const item of orderItems) {
        item.order = savedOrder;
        await queryRunner.manager.save(OrderItem, item);
      }

      // Limpar o carrinho após a criação do pedido
      await this.shoppingCartService.clearCart(cart.id);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['user', 'orderItems', 'orderItems.product', 'payment'],
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'orderItems', 'orderItems.product', 'payment'],
    });
    if (!order) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado`);
    }
    return order;
  }

  async updateStatus(id: string, newStatus: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = newStatus;
    order.updatedAt = new Date();
    return this.orderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Pedido com ID "${id}" não encontrado`);
    }
  }
}
