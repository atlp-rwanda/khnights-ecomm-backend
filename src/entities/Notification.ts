import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import { User } from './User';
import { NotificationItem } from './NotificationItem';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @IsNotEmpty()
  id!: string;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user!: User;

  @OneToMany(() => NotificationItem, notificationItem => notificationItem.notification)
  allNotifications!: NotificationItem[];

  @Column('decimal')
  unRead: number = 0;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  updateUnread (): void {
    if (this.allNotifications) {
      let unRead: number = 0;
      for (let i = 0; i < this.allNotifications.length; i++) {
        if(this.allNotifications[i].isRead === false){
            unRead +=1
        }
      }
      this.unRead = unRead;
    } else {
      this.unRead = 0;
    }
  }
}