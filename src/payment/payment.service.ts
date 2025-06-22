import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service'; // Para atualizar o status do pedido
import { Payment } from './entities/payment.entity';
import { Order } from '@/order/entities/order.entity';
import { PaymentStatus } from './payment-status.enum';
import { OrderStatus } from '@/order/order-status.enum';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>, // Pode ser usado diretamente ou via OrderService
    @InjectRepository(OrderService)
    private readonly orderService: OrderService, // Usaremos o OrderService para atualização de status
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { orderId, amount, method, transactionId } = createPaymentDto;
   
    const order = await this.orderService.findOne(orderId); // Garante que o pedido existe
    if (!order) {
      throw new NotFoundException(`Pedido com ID "${orderId}" não encontrado.`);
    }

    if (order.payment) {
      throw new BadRequestException(`O pedido com ID "${orderId}" já possui um pagamento associado.`);
    }

    if (order.totalAmount !== amount) {
      // Importante: Em um cenário real, você faria uma validação de valores mais robusta
      // E possivelmente integração com um gateway de pagamento real.
      throw new BadRequestException(`O valor do pagamento (${amount}) não corresponde ao total do pedido (${order.totalAmount}).`);
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
      throw new NotFoundException(`Pagamento com ID "${paymentId}" não encontrado.`);
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
      throw new NotFoundException(`Pagamento com ID "${id}" não encontrado.`);
    }
    return payment;
  }
}