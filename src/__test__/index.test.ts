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

describe('Express App', () => {
  it('should have JSON parsing enabled', async () => {
    const response = await request(app)
      .get('/test')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
  });

  it('Should respond to posting route', async () => {
    const response = await request(app)
      .post('/test/posting')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
  });

  it('should respond to a valid route', async () => {
    const response = await request(app)
      .get('/test')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Route works!');
  });

  it('should not respond to invalid route', async () => {
    const response = await request(app)
      .get('/testing/mon')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(404);
  });

  it('should respond to an invalid route with an appropriate message', async () => {
    const response = await request(app)
      .get('/mon')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(404);
  });
});

describe('Application JSON', () =>{
it('Should respond to json', async () =>{
const data ={
  name: 'John',
  age: 20,
  gender:'male'
};
const response = await request(app)
.post('/test/posting')
.set('Content-Type', 'application/json')
.send(data);

expect(response.statusCode).toBe(200);
});
});

describe('APIs protection', () => {
  it('should respond with a 401 status for unauthorized request', async () => {
    const response = await request(app)
      .get('/test/secure')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(401);
  });

  it('should respond with a 500 status for server errors', async () => {
    const response = await request(app)
      .get('/test/error')
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(500);
  });

  it('should respond with correct data', async () => {
    const data = {
      name: 'John',
      age: 20,
      gender: 'male'
    };
    const response = await request(app)
      .post('/test/posting')
      .set('Content-Type', 'application/json')
      .send(data);
 
    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined;
  });
});