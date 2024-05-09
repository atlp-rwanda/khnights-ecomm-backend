import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsNotEmpty, IsString, IsBoolean, ArrayNotEmpty, IsArray, MaxLength } from 'class-validator';
import { User } from './User';
import { Category } from './Category';

@Entity()
@Unique(['id'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User)
  @IsNotEmpty()
  vendor!: User;

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
