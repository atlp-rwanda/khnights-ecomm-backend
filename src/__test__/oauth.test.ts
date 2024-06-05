import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getConnection, getConnectionOptions, getRepository } from 'typeorm';
import { User } from '../entities/User';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

beforeAll(async () => {

  await createConnection();
});

afterAll(async () => {
  await cleanDatabase()
  server.close();
});
describe('authentication routes test',() => {
    it('should redirect to the google authentication page',async() => {
        const response = await request(app)
        .get('/user/google-auth');
        expect(response.statusCode).toBe(302)
    })
    it('should redirect after google authentication', async() => {
        const response = await request(app)
        .get('/user/auth/google/callback');
        expect(response.statusCode).toBe(302)
    })
});

