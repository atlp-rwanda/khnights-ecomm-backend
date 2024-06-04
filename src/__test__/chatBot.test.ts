import request from 'supertest';
import { app, server } from '../index';
import { createConnection} from 'typeorm';
import { cleanDatabase } from './test-assets/DatabaseCleanup';

beforeAll(async () => {
  await createConnection();
});

jest.setTimeout(20000);
afterAll(async () => {
  await cleanDatabase();
  server.close();
});


describe('POST /chat', () => {
  it('should respond with a successful message for a valid user query', async () => {
    const userMessage = 'What kind of items do you have?';
    const response = await request(app) 
      .post('/chat')
      .send({ message: userMessage })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(response.body).toHaveProperty('message'); 
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });
  it('should respond with an error for an empty user message', async () => {
    const emptyMessageReq = { body: { message: '' } };
    const response = await request(app) 
      .post('/chat')
      .send(emptyMessageReq)
    
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('No user message');

  });
  it('should respond with an error for an empty user message', async () => {
    const userMessage = 'dojdojdodjojoqdj';
    const response = await request(app) 
      .post('/chat')
      .send({ message: userMessage })
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Sorry, I am not sure what you mean. Can you rephrase?'); 
     

  });

});
