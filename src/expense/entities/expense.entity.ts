import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { ExpenseCategory } from '../expense-category.enum';
import { User } from '@/users/entities/user.entity';

@Entity('expenses')
export class Expense extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({
    type: 'enum',
    enum: ExpenseCategory,
    nullable: false,
  })
  category: ExpenseCategory;

  @Column({
    type: 'date',
    nullable: false,
    name: 'expense_date',
  })
  expenseDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true, name: 'receipt_url' })
  receiptUrl: string; // URL do comprovante/nota fiscal

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

  // Relacionamento com User (quem registrou a despesa)
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_user_id' })
  createdBy: User | null;
}
