import request from 'supertest';
import {app} from '../index'; // update this with the path to your app file

describe('GET /', () => {
  it('responds with "Knights Ecommerce API"', done => {
    request(app)
      .get('/')
      .expect(200, 'Knights Ecommerce API', done);
  });
});
