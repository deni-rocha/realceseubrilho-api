import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from '@/role/entities/role.entity';
import { ShoppingCart } from '@/shopping-cart/entities/shopping-cart.entity';
import { Order } from '@/order/entities/order.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'password_hash', nullable: false })
  password: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  verified: boolean;

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

  @ManyToOne(() => Role, (role) => role.users, {
    nullable: false,
    eager: false,
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => ShoppingCart, (shoppingCart) => shoppingCart.user)
  shoppingCart: ShoppingCart;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
