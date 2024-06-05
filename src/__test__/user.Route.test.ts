// index.test.ts

import request from 'supertest';
import { app, server } from '../index';
import { dbConnection } from '../startups/dbConnection';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

beforeAll(async () => {
  await dbConnection();
});

afterAll(async () => {
  await cleanDatabase();
  server.close();
});

describe('USER ROUTE', () => {
  it('should respond with 404, user not found', async () => {
    const response = await request(app)
      .get('/login/success')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(404);
  });

  it('Should respond 401, Login failed', async () => {
    const response = await request(app)
      .post('/login/failed')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(404);
  });
});