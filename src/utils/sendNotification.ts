import { Notification } from "../entities/Notification";
import { NotificationItem } from "../entities/NotificationItem";
import { getRepository } from 'typeorm';
import { User } from "../entities/User";
import { getIO } from "./socket";
import { getNotifications } from "./getNotifications";

interface noticationInfo{
    content: string;
    type: 'product'|'cart'|'order'|'user'|'wish list'|'coupon';
    user: User;
    link?: string;
}

export const sendNotification = async (data: noticationInfo) =>{
    try {
        const notificationRepo = getRepository(Notification)
        const notificationItemRepo = getRepository(NotificationItem);

        let notification = await notificationRepo
        .findOne({
            where: {
                user: {id: data.user.id}},
                relations: ['allNotifications', 'user']
            });

        if(!notification){
            notification = new Notification();
            notification.user = data.user;
            await notificationRepo.save(notification);
        }

        const notificationItem = new NotificationItem();
        notificationItem.notification = notification;
        notificationItem.content = data.content;
        notificationItem.type = data.type;
        if(data.link){
            notificationItem.link = data.link
        }
        await notificationItemRepo.save(notificationItem);

        //Update numbers
        notification = await notificationRepo
        .findOne({where: {id: notification.id, user: {id: data.user.id}}, relations: ['allNotifications', 'user'] });

        if(notification){
            notification.updateUnread();
            await notificationRepo.save(notification);
        }

        getIO().emit('notification', {
            action: `${data.user.email} notification`,
            notifications: await getNotifications(data.user.id)
        });
    } catch (error) {
        console.log(error);
    }
};