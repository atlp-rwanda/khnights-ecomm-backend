import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Product } from './Product';
import { Cart } from './Cart';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  @IsNotEmpty()
  cart!: Cart;

  @ManyToOne(() => Product)
  @IsNotEmpty()
  product!: Product;

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  newPrice!: number;

  @Column('int')
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @Column('decimal')
  total!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateTotal (): void {
    this.total = this.newPrice * this.quantity;
  }
}