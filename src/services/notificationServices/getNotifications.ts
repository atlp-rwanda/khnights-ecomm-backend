import { Request, Response } from 'express';
import { Notification } from '../../entities/Notification';
import { responseSuccess, responseError } from '../../utils/response.utils';
import { getRepository } from 'typeorm';

export const getNotificationsService = async(req: Request, res: Response) => {
    try {
        const notificationRepo = getRepository(Notification);

        const notification = await notificationRepo
        .findOne({where: {user: { id: req.user?.id }}, relations: ['user','allNotifications'],
        order: {
            createdAt: 'DESC',
        },
        });

        if(!notification){
            return responseSuccess(res, 200, `User doesn't have any notifications.`, { notificationDetails: {} });
        }
        
        const notificationDetails = {
            id: notification.id,
            notifications: notification.allNotifications,
            unRead: notification.unRead
        };

        return responseSuccess(res, 200, 'Notifications retrieved successfully', { notificationDetails });
    } catch (error) {
        return responseError(res, 500, (error as Error).message);
    }
};