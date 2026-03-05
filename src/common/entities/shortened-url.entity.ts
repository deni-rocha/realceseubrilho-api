import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
} from 'typeorm';

@Entity('shortened_urls')
export class ShortenedUrl extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, length: 50 })
  shortCode: string;

  @Column({ type: 'varchar', length: 500 })
  originalUrl: string;

  @Column({ type: 'varchar', nullable: true })
  context: string; // Ex: 'order', 'product', etc.

  @Column({ type: 'varchar', nullable: true })
  contextId: string; // Ex: orderId, productId, etc.

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @Column({
    type: 'int',
    default: 0,
    name: 'click_count',
    nullable: false,
  })
  clickCount: number;

  @Column({ type: 'boolean', default: true, nullable: false })
  isActive: boolean;
}
