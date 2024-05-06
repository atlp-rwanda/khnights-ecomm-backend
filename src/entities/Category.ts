import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}