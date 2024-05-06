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
import { IsDate, IsNotEmpty, IsArray, IsIn } from 'class-validator';
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
  @IsIn(['percentage', 'money'])
  discountType!: 'percentage' | 'money';

  @Column('float')
  @IsNotEmpty()
  discountRate!: number;

  @Column('timestamp', { nullable: false })
  @IsNotEmpty()
  @IsDate()
  expirationDate?: Date;

  @Column('int', { default: 0 })
  @IsNotEmpty()
  usageTimes!: number;

  @Column('int')
  @IsNotEmpty()
  maxUsageLimit!: number;

  @Column('simple-array', { nullable: true, default: '' })
  @IsArray()
  usedBy!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}