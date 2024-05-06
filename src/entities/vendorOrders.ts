import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsDate, IsIn, isNotEmpty } from 'class-validator';
import { User } from './User';
import { OrderItem } from './OrderItem';
import { Transaction } from './transaction';
import { Order } from './Order';
import { VendorOrderItem } from './VendorOrderItem';

@Entity()
export class VendorOrders {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User)
  @IsNotEmpty()
  vendor!: User;

  @OneToMany(() => VendorOrderItem, vendorOrderItems => vendorOrderItems.order, { cascade: true })
  @IsNotEmpty()
  vendorOrderItems!: VendorOrderItem[];

  @ManyToOne(() => Order)
  @IsNotEmpty()
  order!: Order;

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  totalPrice!: number;

  @Column({ default: 'pending' })
  @IsIn(['pending', 'is-accepted', 'in-transit', 'cancelled', 'delivered', 'completed'])
  orderStatus!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}