import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getConnection, getConnectionOptions, getRepository } from 'typeorm';
import { User } from '../entities/User';

beforeAll(async () => {
  // Connect to the test database
  const connectionOptions = await getConnectionOptions();

  await createConnection({ ...connectionOptions, name: 'testConnection' });
});

afterAll(async () => {
  const connection = getConnection('testConnection');
  const userRepository = connection.getRepository(User);

  // Delete all records from the User
  await userRepository.delete({});

  // Close the connection to the test database
  await connection.close();

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

