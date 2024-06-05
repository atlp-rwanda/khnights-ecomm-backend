import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  Unique,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from './User';

@Entity('wishlist')
@Unique(['id'])
export class wishList extends BaseEntity {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  id!: number;

  @Column()
  @IsNotEmpty()
  @IsString()
  productId!: string;

  @ManyToOne(() => User)
  @IsNotEmpty()
  buyer!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
