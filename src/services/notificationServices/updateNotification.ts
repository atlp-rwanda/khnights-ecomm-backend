import { Request, Response } from 'express';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';
import { NotificationItem } from '../../entities/NotificationItem';
import { Notification } from '../../entities/Notification';
import { getIO } from '../../utils/socket';
import { getNotifications } from '../../utils/getNotifications';

export const updateNotificationsService = async (req: Request, res: Response) => {
    try {
        let notificationIds: string[] = req.body.notificationIds;
        notificationIds = Array.from(new Set(notificationIds));

        if (!notificationIds.length) {
            return responseError(res, 400, 'Please provide Notification IDs to update');
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
                    notificationItem.isRead = true;
                    await notificationItemRepo.save(notificationItem);
                    notificationItems.push(id);
                }
            } catch (error) {
                continue;
            }
        }

        const notification = await notificationRepo
            .findOne({
                where: { user: { id: req.user?.id } },
                relations: ['allNotifications', 'user']
            });

        if (notification) {
            notification.updateUnread();
            await notificationRepo.save(notification);
        }

        getIO().emit('notification', {
            action: `${req.user?.email} notification`,
            notifications: await getNotifications(req.user!.id!)
        });

        return responseSuccess(res, 200, `${notificationItems.length} of ${notificationIds.length} Notification(s) was successfully updated.`);

    } catch (error) {
        return responseError(res, 500, (error as Error).message);
    }
};

export const updateAllNotificationsService = async (req: Request, res: Response) => {
    try {

        const notificationRepo = getRepository(Notification);
        const notificationItemRepo = getRepository(NotificationItem);

        const notification = await notificationRepo
            .findOne({
                where: {
                    user: {
                        id: req.user?.id
                    },
                    allNotifications: {
                        isRead: false
                    }
                },
                relations: ['allNotifications']
            });

        if (!notification || !notification.allNotifications.length) {
            responseSuccess(res, 200, "User doesn't have any unread notifications.");
            return;
        }

        for (const notificationItem of notification.allNotifications) {
            notificationItem.isRead = true;
            await notificationItemRepo.save(notificationItem);
        }

        if (notification) {
            notification.updateUnread();
            await notificationRepo.save(notification);
        }

        getIO().emit('notification', {
            action: `${req.user?.email} notification`,
            notifications: await getNotifications(req.user!.id!)
        });

        return responseSuccess(res, 200, `All your unread notifications was successfully updated as read.`, notification);

    } catch (error) {
        return responseError(res, 500, (error as Error).message);
    }
};