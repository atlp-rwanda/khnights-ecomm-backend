import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { IsNotEmpty } from 'class-validator';
import { Order } from './Order';

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @Column('text')
  comment!: string;

  @ManyToOne(() => User, user => user.feedbacks)
  user!: User;

  @ManyToOne(() => Product, product => product.feedbacks)
  product!: Product;

  @ManyToOne(() => Order, order => order.feedbacks)
  order!: Order;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}