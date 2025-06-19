import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { ProductCategory } from '@/product-category/entities/product-category.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, BaseEntity } from 'typeorm';


@Entity('products')
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  stockQuantity: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at', nullable: false })
  updatedAt: Date;

  @ManyToOne(() => ProductCategory, category => category.products, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: ProductCategory;

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];
}