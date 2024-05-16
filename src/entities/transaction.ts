import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { User } from './User';
import { Order } from './Order';
import { Product } from './Product'; // Assuming Product entity exists

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'orderId' })
  order?: Order;

  @ManyToOne(() => Product, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  previousBalance!: number;

  @Column({ type: 'numeric', precision: 15, scale: 2, default: 0 })
  @IsNotEmpty()
  @IsNumber()
  currentBalance!: number;

  @Column({ type: 'enum', enum: ['debit', 'credit'] })
  @IsNotEmpty()
  @IsString()
  type!: 'debit' | 'credit';

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
