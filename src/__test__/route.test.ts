import request from 'supertest';
import {app, server} from '../index'; // update this with the path to your app file

describe('GET /', () => {
    afterAll(done => {
        server.close(done);
      });

  it('responds with "Knights Ecommerce API"', done => {
    request(app)
      .get('/')
      .expect(200, 'Knights Ecommerce API', done);
  });
});
