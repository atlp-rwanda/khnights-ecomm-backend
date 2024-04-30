import request from 'supertest';
import { app, server } from '../index'; // update this with the path to your app file

import { createConnection, getConnection, getConnectionOptions } from 'typeorm';

beforeAll(async () => {
  // Connect to the test database
  const connectionOptions = await getConnectionOptions();
  await createConnection({ ...connectionOptions, name: 'testConnection' });
});
afterAll(async () => {
  await getConnection('testConnection').close();
  server.close();
});

describe('GET /', () => {
  // afterAll(done => {
  //   server.close(done);
  // });

  it('responds with "Knights Ecommerce API"', done => {
    request(app).get('/').expect(200, 'Knights Ecommerce API', done);
  });
});
