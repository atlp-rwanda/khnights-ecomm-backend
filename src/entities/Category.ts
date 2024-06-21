import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Product } from './Product';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ManyToMany(() => Product, product => product.categories)
  products!: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
