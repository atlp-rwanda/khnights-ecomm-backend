import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, ArrayNotEmpty, IsArray, MaxLength } from 'class-validator';
import { User } from './User';
import { Category } from './Category';
import { Order } from './Order';
import { Coupon } from './coupon';

@Entity()
@Unique(['id'])
export class Product {
  static query() {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User)
  @IsNotEmpty()
  vendor!: User;

  @OneToMany(() => Order, (order: any) => order.product) // Specify the inverse side of the relationship
  orders!: Order[];

  @OneToOne(() => Coupon, (coupons: any) => coupons.product)
  @JoinColumn()
  coupons?: Coupon;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column()
  @IsNotEmpty()
  description!: string;

  @Column('simple-array')
  @IsArray()
  @ArrayNotEmpty()
  @MaxLength(10)
  images!: string[];

  @Column('decimal')
  @IsNotEmpty()
  newPrice!: number;

  @Column('decimal', { nullable: true })
  oldPrice?: number;

  @Column('timestamp', { nullable: true })
  expirationDate?: Date;

  @Column('int')
  @IsNotEmpty()
  quantity!: number;

  @Column({ default: true })
  @IsBoolean()
  isAvailable!: boolean;

  @ManyToMany(() => Category)
  @JoinTable()
  categories!: Category[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
