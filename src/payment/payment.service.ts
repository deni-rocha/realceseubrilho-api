import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service'; // Para atualizar o status do pedido
import { Payment } from './entities/payment.entity';
import { Order } from '@/order/entities/order.entity';
import { PaymentMethod } from './payment.method';
import { PaymentStatus } from './payment-status.enum';
import { OrderStatus } from '@/order/order-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>, // Pode ser usado diretamente ou via OrderService
    private readonly orderService: OrderService, // Usaremos o OrderService para atualização de status
  ) {}

  async createPayment(orderId: string, amount: number, method: PaymentMethod, transactionId?: string): Promise<Payment> {
    const order = await this.orderService.findOne(orderId); // Garante que o pedido existe
    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found.`);
    }

    if (order.payment) {
        throw new BadRequestException(`Order with ID "${orderId}" already has a payment associated.`);
    }

    if (order.totalAmount !== amount) {
        // Importante: Em um cenário real, você faria uma validação de valores mais robusta
        // E possivelmente integração com um gateway de pagamento real.
        throw new BadRequestException(`Payment amount (${amount}) does not match order total (${order.totalAmount}).`);
    }

    const newPayment = new Payment();
    newPayment.order = order; // Associar o pagamento ao pedido
    newPayment.amount = amount;
    newPayment.method = method;
    newPayment.transactionId = transactionId || null; // Pode ser opcional, dependendo do método de pagamento
    newPayment.status = PaymentStatus.PENDING; // Começa como pendente
    newPayment.paymentDate = new Date();
    newPayment.createdAt = new Date();
    newPayment.updatedAt = new Date();

    const savedPayment = await this.paymentRepository.save(newPayment);

    // Associar o pagamento ao pedido e atualizar o status do pedido
    order.payment = savedPayment;
    await this.orderRepository.save(order); // Ou use orderService.updateOrderStatus

    return savedPayment;
  }

  async updatePaymentStatus(paymentId: string, newStatus: PaymentStatus): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId }, relations: ['order'] });
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${paymentId}" not found.`);
    }

    payment.status = newStatus;
    payment.updatedAt = new Date();
    const updatedPayment = await this.paymentRepository.save(payment);

    // Opcional: Atualizar o status do pedido com base no status do pagamento
    // Isso pode ser uma lógica mais complexa dependendo do fluxo
    if (updatedPayment.order) {
      if (newStatus === PaymentStatus.COMPLETED) {
        await this.orderService.updateStatus(updatedPayment.order.id, OrderStatus.PROCESSING);
      } else if (newStatus === PaymentStatus.REFUNDED) {
        await this.orderService.updateStatus(updatedPayment.order.id, OrderStatus.REFUNDED);
      } else if (newStatus === PaymentStatus.FAILED) {
        await this.orderService.updateStatus(updatedPayment.order.id, OrderStatus.CANCELLED);
      }
    }

    return updatedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['order'] });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({ where: { id }, relations: ['order'] });
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    return payment;
  }
}