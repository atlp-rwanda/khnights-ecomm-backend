import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty } from 'class-validator';
import { User } from './User';
import { Product } from './Product';

@Entity()
@Unique(['id'])
@Unique(['code']) // Ensure only 'code' is unique
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User)
  @IsNotEmpty()
  @JoinColumn()
  vendor!: User;

  @ManyToOne(() => Product, product => product.coupons)
  @IsNotEmpty()
  @JoinColumn()
  product!: Product;

  @Column()
  @IsNotEmpty()
  code!: string;

  @Column()
  @IsNotEmpty()
  discountType!: string;

  @Column('float')
  @IsNotEmpty()
  discountRate!: number;

  @Column('timestamp', { nullable: false })
  @IsNotEmpty()
  @IsDate()
  expirationDate?: Date;

  @Column('int')
  @IsNotEmpty()
  maxUsageLimit!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
