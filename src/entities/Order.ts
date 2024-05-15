import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsNumber, IsDate } from 'class-validator';
import { User } from './User';
import { Product } from './Product';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User, user => user.orders) // <- Correctly reference the User entity and its orders property
  @IsNotEmpty()
  buyer!: User;

  @ManyToOne(() => Product, product => product.orders) // <- Correctly reference the Product entity and its orders property
  @IsNotEmpty()
  product!: Product;

  @Column('decimal')
  @IsNotEmpty()
  @IsNumber()
  totalPrice!: number;

  @Column('int')
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @Column()
  @IsDate()
  @IsNotEmpty()
  orderDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
