
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsIn } from 'class-validator';
import { roles } from '../utils/roles';
import { Order } from './Order';
import { Transaction } from './transaction';
import { Feedback } from './Feedback';

export interface UserInterface {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
  phoneNumber: string;
  photoUrl?: string;
  verified?: boolean;
  twoFactorEnabled?: boolean;
  status?: 'active' | 'suspended';
  userType: 'Admin' | 'Buyer' | 'Vendor';
  role?: string;
  twoFactorCode?: string;
  twoFactorCodeExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  firstName!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @Column()
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Column()
  @IsNotEmpty()
  password!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  gender!: string;

  @Column()
  @IsNotEmpty()
  phoneNumber!: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  verified!: boolean;

  @Column({ default: 'active' })
  @IsNotEmpty()
  @IsIn(['active', 'suspended'])
  status!: 'active' | 'suspended';

  @Column({ default: 'Buyer' })
  @IsNotEmpty()
  @IsIn(['Admin', 'Buyer', 'Vendor'])
  userType!: 'Admin' | 'Buyer' | 'Vendor';

  @Column({ default: false })
  @IsBoolean()
  twoFactorEnabled!: boolean;

  @Column({ nullable: true })
  twoFactorCode?: string;

  @Column({ type: 'timestamp', nullable: true })
  twoFactorCodeExpiresAt?: Date;

  @Column()
  role!: string;

  @OneToMany(() => Order, (order: any) => order.buyer)
  orders!: Order[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions!: Transaction[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'numeric', precision: 24, scale: 2, default: 0 })
  accountBalance!: number;
  @OneToMany(() => Feedback, feedback => feedback.product)
  feedbacks!: Feedback[];

  @BeforeInsert()
  setRole(): void {
    this.role = this.userType === 'Vendor' ? roles.vendor : roles.buyer;
  }
}