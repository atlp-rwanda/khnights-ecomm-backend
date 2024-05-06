import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Order } from './Order';
import { Product } from './Product';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => Order, order => order.orderItems)
  @IsNotEmpty()
  order!: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  @IsNotEmpty()
  product!: Product;

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  price!: number;

  @Column('int')
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;
}