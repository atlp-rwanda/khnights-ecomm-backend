import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Order } from './Order';
import { Product } from './Product';
import { VendorOrders } from './vendorOrders';

@Entity()
export class VendorOrderItem {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  'id'!: string;

  @ManyToOne(() => VendorOrders, order => order.vendorOrderItems)
  @IsNotEmpty()
  'order'!: VendorOrders;

  @ManyToOne(() => Product, product => product.vendorOrderItems)
  @IsNotEmpty()
  'product'!: Product;

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  'price/unit'!: number;

  @Column('int')
  @IsNotEmpty()
  @IsNumber()
  'quantity'!: number;
}
