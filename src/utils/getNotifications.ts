import { getRepository } from "typeorm";
import { Notification } from "../entities/Notification";

export const getNotifications = async (userId: string) => {
    try {
        const notificationRepository = getRepository(Notification);

        const notifications = await notificationRepository.findOne({
            where: {
                user: {
                    id: userId
                }
            },
            relations: {
                allNotifications: true
            }
        });

        if (!notifications) {
            return {};
        }
        return notifications;
    } catch (error) {
        console.error((error as Error).message);
        return {};
    }
};