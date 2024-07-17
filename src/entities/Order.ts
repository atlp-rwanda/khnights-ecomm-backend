import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsDate, IsIn } from 'class-validator';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { Transaction } from './transaction';
import { Feedback } from './Feedback';
import { Cart } from './Cart';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User, user => user.orders)
  @IsNotEmpty()
  buyer!: User;
  
  @Column('uuid')
  @IsNotEmpty()
  cartId!: string;
  
  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  @IsNotEmpty()
  orderItems!: OrderItem[];

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  totalPrice!: number;

  @OneToMany(() => Transaction, transaction => transaction.order)
  transactions!: Transaction[];

  @OneToMany(() => Feedback, feedback => feedback.order)
  feedbacks!: Feedback[];

  @Column({ default: 'order placed' })
  @IsNotEmpty()
  @IsIn([
    'order placed',
    'cancelled',
    'awaiting shipment',
    'in transit',
    'delivered',
    'received',
    'returned',
    'completed',
  ])
  orderStatus!: string;

  @Column('int')
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @Column({ default: 'City, Country street address' })
  address!: string;

  @Column()
  @IsDate()
  @IsNotEmpty()
  orderDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
