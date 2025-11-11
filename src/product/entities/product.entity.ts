import { CartItem } from '@/cart-item/entities/cart-item.entity';
import { OrderItem } from '@/order-item/entities/order-item.entity';
import { ProductCategory } from '@/product-category/entities/product-category.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
  BaseEntity,
} from 'typeorm';

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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    default: 0,
  })
  cost: number; // Custo de aquisição do produto

  @Column({ type: 'int', nullable: false, default: 0 })
  stockQuantity: number;

  @Column({ type: 'text', array: true, default: [] })
  imageUrls: string[];

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
    nullable: false,
  })
  updatedAt: Date;

  @ManyToMany(() => ProductCategory, (category) => category.products, {
    cascade: true,
  })
  @JoinTable({
    name: 'product_categories_relation',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories: ProductCategory[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
