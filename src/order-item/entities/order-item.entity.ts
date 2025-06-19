import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Order } from '../order/order.entity'; // Importa Order
import { Product } from '../product/product.entity'; // Importa Product

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price', nullable: false })
  unitPrice: number; // Preço do produto no momento da compra (fixo para o pedido)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  subtotal: number; // unitPrice * quantity

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at', nullable: false })
  updatedAt: Date;

  // Relacionamento com Order (Muitos itens para um pedido)
  @ManyToOne(() => Order, order => order.orderItems, {
    nullable: false,
    onDelete: 'CASCADE', // Se o pedido for deletado, os itens também
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // Relacionamento com Product (Um item de pedido se refere a um produto)
  @ManyToOne(() => Product, product => product.orderItems, {
    nullable: false,
    eager: true, // Carrega o produto junto com o item do pedido
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}