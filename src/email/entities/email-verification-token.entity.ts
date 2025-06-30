import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BaseEntity,
  } from 'typeorm';
  import { User } from '@/users/entities/user.entity';
  
  @Entity('email_verification_tokens')
  export class EmailVerificationToken extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    token: string;
  
    @Column({ type: 'timestamp', name: 'expires_at', nullable: false })
    expiresAt: Date;
  
    @Column({ type: 'boolean', default: false, nullable: false })
    used: boolean;
  
    @Column({
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      name: 'created_at',
      nullable: false,
    })
    createdAt: Date;
  
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  }