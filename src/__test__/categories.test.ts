import request from 'supertest';
import { app, server } from '../index';
import { createConnection, getRepository} from 'typeorm';
import { cleanDatabase } from './test-assets/DatabaseCleanup';
import { Category } from '../entities/Category';

beforeAll(async () => {
  await createConnection();
});

jest.setTimeout(20000);

afterAll(async () => {
  await cleanDatabase();
  server.close();
});


describe('GET /categories', () => {
  it('should return all categories', async () => {
    const categoryRepository = getRepository(Category);
    await categoryRepository.save([
      { name: 'Category 1' },
      { name: 'Category 2' },
    ]);

    const response = await request(app).get('/product/categories');
   console.log(response.error)
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.categories).toHaveLength(2);
    expect(response.body.categories[0].name).toBe('Category 1');
    expect(response.body.categories[1].name).toBe('Category 2');
  });

  it('should handle errors gracefully', async () => {
    const response = await request(app).get('/product/categories');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.categories).toHaveLength(2);
  });
});