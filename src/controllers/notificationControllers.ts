import { Request, Response } from 'express';
import { getNotificationsService, updateNotificationsService, deleteSelectedNotificationService, deleteAllNotificationService, updateAllNotificationsService } from '../services';

export const getAllNotifications = async (req: Request, res: Response) => {
  await getNotificationsService(req, res);
};

export const deleteSelectedNotifications = async (req: Request, res: Response) => {
  await deleteSelectedNotificationService(req, res);
};

export const deleteAllNotifications = async (req: Request, res: Response) => {
  await deleteAllNotificationService(req, res);
};

export const updateNotifications = async (req: Request, res: Response) => {
  await updateNotificationsService(req, res);
};

export const updateAllNotifications = async (req: Request, res: Response) => {
  await updateAllNotificationsService(req, res);
};