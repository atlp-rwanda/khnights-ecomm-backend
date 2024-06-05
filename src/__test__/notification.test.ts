import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import { dbConnection } from '../startups/dbConnection';
import { User, UserInterface } from '../entities/User';
import { v4 as uuid } from 'uuid';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { Notification } from '../entities/Notification';
import { NotificationItem } from '../entities/NotificationItem';
import exp from 'constants';

const user1Id = uuid();
const user2Id = uuid();
const user3Id = uuid();

const notificationId = uuid();
const notification2Id = uuid();

const notificationItemId = uuid();
const notificationItem2Id = uuid();
const notificationItem3Id = uuid();

const jwtSecretKey = process.env.JWT_SECRET || '';

const getAccessToken = (id: string, email: string) => {
    return jwt.sign(
        {
            id: id,
            email: email,
        },
        jwtSecretKey
    );
};

const sampleUser: UserInterface = {
    id: user1Id,
    firstName: 'vendor1',
    lastName: 'user',
    email: 'vendor1@example.com',
    password: 'password',
    userType: 'Vendor',
    gender: 'Male',
    phoneNumber: '126380996347',
    photoUrl: 'https://example.com/photo.jpg',
    role: 'VENDOR',
};
const sampleUser2: UserInterface = {
    id: user2Id,
    firstName: 'buyer1',
    lastName: 'user',
    email: 'buyer1@example.com',
    password: 'password',
    userType: 'Buyer',
    gender: 'Male',
    phoneNumber: '126380996347',
    photoUrl: 'https://example.com/photo.jpg',
    role: 'BUYER',
};

const sampleUser3: UserInterface = {
    id: user3Id,
    firstName: 'buyer2',
    lastName: 'user',
    email: 'buyer2@example.com',
    password: 'password',
    userType: 'Buyer',
    gender: 'Male',
    phoneNumber: '1347',
    photoUrl: 'https://example.com/photo.jpg',
    role: 'BUYER',
};

const sampleNotification = {
    id: notificationId,
    unRead: 2,
    user: sampleUser
};

const sampleNotification2 = {
    id: notification2Id,
    unRead: 1,
    user: sampleUser3
};

const sampleNotificationItem = {
    id: notificationItemId,
    content: "This is notification content for test",
    type: 'order',
    isRead: false,
    link: '/link/to/more-detail',
    notification: sampleNotification
};


const sampleNotificationItem2 = {
    id: notificationItem2Id,
    content: "This is notification content for test",
    type: 'order',
    isRead: false,
    link: '/link/to/more-detail',
    notification: sampleNotification
};

const sampleNotificationItem3 = new NotificationItem();
sampleNotificationItem3.id = notificationItem3Id;
sampleNotificationItem3.content = "This is notification content for test";
sampleNotificationItem3.type = 'order';
sampleNotificationItem3.isRead = false;
sampleNotificationItem3.link = '/link/to/more-details';


beforeAll(async () => {
    const connection = await dbConnection();

    const userRepository = connection?.getRepository(User);
    await userRepository?.save({ ...sampleUser });
    await userRepository?.save({ ...sampleUser2 });
    await userRepository?.save({ ...sampleUser3 });

    const notificationRepository = connection?.getRepository(Notification);
    await notificationRepository?.save({ ...sampleNotification });

    const result = await notificationRepository?.save({ ...sampleNotification2 });

    const notificationItemRepository = connection?.getRepository(NotificationItem);
    if (result) sampleNotificationItem3.notification = result;
    await notificationItemRepository?.save({ ...sampleNotificationItem });
    await notificationItemRepository?.save({ ...sampleNotificationItem2 });
    await notificationItemRepository?.save({ ...sampleNotificationItem3 });
});

afterAll(async () => {
    await cleanDatabase();

    server.close();
});

describe('Notifications Tests', () => {
    it('Should return all notification for authenticated user', async () => {
        const response = await request(app)
            .get('/notification/')
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('Notifications retrieved successfully');
    });

    it('Should return empty object if user doesn\'t have any notification', async () => {
        const response = await request(app)
            .get('/notification/')
            .set('Authorization', `Bearer ${getAccessToken(sampleUser2.id!, sampleUser2.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('User doesn\'t have any notifications.');
    });

    it('should update selected notifications, if there valid Ids and exist in DB', async () => {
        const response = await request(app)
            .put(`/notification/`)
            .send({
                notificationIds: [notificationItemId, 'sdfsdfd']
            })
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('1 of 2 Notification(s) was successfully updated.');
    });

    it('should return 400, if no notifications ids provided to update', async () => {
        const response = await request(app)
            .put(`/notification/`)
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(400);
    });

    it('should update all unread notifications for authenticated user', async () => {
        const response = await request(app)
            .put(`/notification/all`)
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('All your unread notifications was successfully updated as read.');
    });

    it('should not update any notification if user doesn\'t have unread notifications.', async () => {
        const response = await request(app)
            .put(`/notification/all`)
            .set('Authorization', `Bearer ${getAccessToken(sampleUser2.id!, sampleUser2.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('User doesn\'t have any unread notifications.');
    });

    it('should delete selected notifications, if there valid Ids and exist in DB', async () => {
        const response = await request(app)
            .delete(`/notification/`)
            .send({
                notificationIds: [notificationItem3Id, 'sdfsdfd']
            })
            .set('Authorization', `Bearer ${getAccessToken(sampleUser3.id!, sampleUser3.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('1 of 2 Notification(s) was successfully deleted.');
    });

    it('should return 400, if no notifications ids provided to delete', async () => {
        const response = await request(app)
            .delete(`/notification/`)
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(400);
    });

    it('should delete all notification for authenticated user.', async () => {
        const response = await request(app)
            .delete(`/notification/all`)
            .set('Authorization', `Bearer ${getAccessToken(sampleUser.id!, sampleUser.email)}`);

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBe('All Notifications was successfully deleted.');
    });
    it('Should not delete any notification, if user doesn\'t have notifications', async () => {
        const response = await request(app)
            .delete('/notification/all')
            .set('Authorization', `Bearer ${getAccessToken(sampleUser2.id!, sampleUser2.email)}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('User doesn\'t have notifications');
    });
});