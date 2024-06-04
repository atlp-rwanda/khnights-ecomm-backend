import { Request, Response } from 'express';
import { Notification } from '../../entities/Notification';
import { NotificationItem } from '../../entities/NotificationItem';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { getIO } from '../../utils/socket';
import { getNotifications } from '../../utils/getNotifications';

export const deleteSelectedNotificationService = async (req: Request, res: Response) => {
    try {
        let notificationIds: string[] = req.body.notificationIds;
        notificationIds = Array.from(new Set(notificationIds));

        if (!notificationIds.length) {
            return responseError(res, 400, 'Please provide Notification IDs to delete');
        }

        const notificationRepo = getRepository(Notification);
        const notificationItemRepo = getRepository(NotificationItem);

        const notificationItems: string[] = [];

        for (const id of notificationIds) {
            try {
                const notificationItem = await notificationItemRepo.findOne({
                    where: {
                        id: id,
                        notification: {
                            user: {
                                id: req.user?.id
                            }
                        }
                    }
                });
        
                if (notificationItem) {
                    await notificationItemRepo.remove(notificationItem);
                    notificationItems.push(id);
                }
            } catch (error) {
                continue;
            }
        }

        const notification = await notificationRepo
            .findOne({
                where: { user: { id: req.user?.id } },
                relations: ['allNotifications']
            });

        if (notification) {
            notification.updateUnread();
            await notificationRepo.save(notification);
        }

        getIO().emit('notification', {
            action: `${req.user?.email} notification`,
            notifications: await getNotifications(req.user!.id!)
        });

        return responseSuccess(res, 200, `${notificationItems.length} of ${notificationIds.length} Notification(s) was successfully deleted.`);

    } catch (error) {
        return responseError(res, 500, (error as Error).message);
    }
};

export const deleteAllNotificationService = async (req: Request, res: Response) => {
    try {
        const notificationRepo = getRepository(Notification);


        const notification = await notificationRepo
            .findOne({
                where: { user: { id: req.user?.id } },
                relations: ['allNotifications', 'user']
            });

        if (!notification || !notification.allNotifications.length ) {
            responseError(res, 404, "User doesn't have notifications");
            return;
        }
        
        await notificationRepo.remove(notification);

        getIO().emit('notification', {
            action: `${req.user?.email} notification`,
            notifications: await getNotifications(req.user!.id!)
        });

        return responseSuccess(res, 200, `All Notifications was successfully deleted.`);

    } catch (error) {
        return responseError(res, 500, (error as Error).message);
    }
};
