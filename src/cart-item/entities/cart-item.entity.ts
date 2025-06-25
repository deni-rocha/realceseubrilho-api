import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ShoppingCart } from '../../shopping-cart/entities/shopping-cart.entity'; // Importa ShoppingCart
import { Product } from '../../product/entities/product.entity'; // Importa Product

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'unit_price',
    nullable: false,
  })
  unitPrice: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'sub_total',
    nullable: false,
  })
  subtotal: string;

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

  @ManyToOne(() => ShoppingCart, (cart) => cart.cartItems, {
    nullable: false,
    onDelete: 'CASCADE', // Se o carrinho for deletado, os itens também
  })
  @JoinColumn({ name: 'cart_id' })
  cart: ShoppingCart;

  // Relacionamento com Product (Um item de carrinho se refere a um produto)
  @ManyToOne(() => Product, (product) => product.cartItems, {
    nullable: false,
    eager: true, // Carrega o produto junto com o item do carrinho
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
