import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
import { IsNotEmpty, IsIn, IsBoolean } from 'class-validator';
import { Notification } from './Notification';

@Entity()
export class NotificationItem{
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => Notification, nofication => nofication.allNotifications, { onDelete: 'CASCADE' })
  @IsNotEmpty()
  notification!: Notification;

  @Column()
  @IsNotEmpty()
  content!: string 

  @Column()
  @IsNotEmpty()
  @IsIn([
    'product',
    'cart',
    'order',
    'user',
    'wishlist',
    'coupon',
  ])
  type!: string 

  @Column({ default: false })
  @IsNotEmpty()
  @IsBoolean()
  isRead!: boolean;

  @Column({ nullable: true })
  link!: string;

  @CreateDateColumn()
  createdAt!: Date;
}