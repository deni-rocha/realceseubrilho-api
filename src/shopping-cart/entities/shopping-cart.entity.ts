import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, BaseEntity } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Importa User
import { CartItem } from '../../cart-item/entities/cart-item.entity'; // Importa CartItem

@Entity('shopping_carts')
export class ShoppingCart extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at', nullable: false })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at', nullable: false })
  updatedAt: Date;

  // Relacionamento com User (Um carrinho pertence a um usuário)
  @OneToOne(() => User, user => user.shoppingCart, {
    nullable: false,
    onDelete: 'CASCADE', // Se o usuário for deletado, o carrinho também é
  })
  @JoinColumn({ name: 'user_id' }) // Coluna FK na tabela 'shopping_carts'
  user: User;

  // Um carrinho pode ter muitos itens de carrinho
  @OneToMany(() => CartItem, cartItem => cartItem.cart)
  cartItems: CartItem[];
}