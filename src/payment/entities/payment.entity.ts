import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BaseEntity } from 'typeorm';
import { PaymentStatus } from '../payment-status.enum';
import { PaymentMethod } from '../payment.method';
import { Order } from '@/order/entities/order.entity';


@Entity('payments')
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'payment_date', nullable: false })
  paymentDate: Date;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING, nullable: false })
  status: PaymentStatus;

  @Column({ type: 'varchar', nullable: true, unique: false, name: 'transaction_id' })
  transactionId: string | null; // ID da transação na operadora de pagamento

  @Column({ type: 'enum', enum: PaymentMethod, nullable: false })
  method: PaymentMethod;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at', nullable: false })
  updatedAt: Date;

  // Relacionamento com Order (Um pagamento pertence a um pedido)
  // O lado 'owner' da relação OneToOne, portanto a FK está aqui
  @OneToOne(() => Order, order => order.payment, {
    nullable: false, // Um pagamento deve estar ligado a um pedido
  })
  @JoinColumn({ name: 'order_id' }) // Coluna FK na tabela 'payments'
  order: Order;
}