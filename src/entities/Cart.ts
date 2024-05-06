import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsBoolean } from 'class-validator';
import { User } from './User';
import { CartItem } from './CartItem';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @OneToMany(() => CartItem, (cartItem: any) => cartItem.cart)
  items!: CartItem[];

  @Column('decimal')
  totalAmount: number = 0;

  @Column({ default: false })
  @IsBoolean()
  isCheckedOut: boolean = false;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  updateTotal (): void {
    if (this.items) {
      let total: number = 0;
      for (let i = 0; i < this.items.length; i++) {
        total += Number(this.items[i].total);
      }
      this.totalAmount = total;
    } else {
      this.totalAmount = 0;
    }
  }
}