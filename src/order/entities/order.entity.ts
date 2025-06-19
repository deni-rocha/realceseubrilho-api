import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User } from '../user/user.entity'; // Importa User
import { OrderItem } from '../order-item/order-item.entity'; // Importa OrderItem
import { Payment } from '../payment/payment.entity'; // Importa Payment
import { OrderStatus } from './order-status.enum'; // Importa o enum de status

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'order_date', nullable: false })
  orderDate: Date;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING, nullable: false })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount', nullable: false })
  totalAmount: number;

  @Column({ type: 'varchar', name: 'shipping_address', nullable: false })
  shippingAddress: string;

  @Column({ type: 'varchar', name: 'payment_method', nullable: false })
  paymentMethod: string; // Isso é apenas para registro, a entidade Payment detalha mais

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at', nullable: false })
  updatedAt: Date;

  // Relacionamento com User (Um pedido pertence a um usuário)
  @ManyToOne(() => User, user => user.orders, {
    nullable: false,
    onDelete: 'RESTRICT', // Não permite deletar usuário se tiver pedidos
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relacionamento com OrderItem (Um pedido tem muitos itens)
  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];

  // Relacionamento com Payment (Um pedido tem um pagamento)
  @OneToOne(() => Payment, payment => payment.order, {
    nullable: true, // Um pedido pode estar pendente de pagamento
    onDelete: 'CASCADE', // Se o pedido for deletado, o pagamento associado também
  })
  @JoinColumn({ name: 'payment_id' }) // Coluna FK na tabela 'orders'
  payment: Payment;
}