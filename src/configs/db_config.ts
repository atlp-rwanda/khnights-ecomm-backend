import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import dotenv from 'dotenv';

dotenv.config();

const OrmConfig = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  synchronize: process.env.NODE_ENV === 'dev' ? false : false,

  logging: process.env.NODE_ENV === 'dev' ? false : false,
  entities: [User],
  migrations: [__dirname + '/migration/*.ts'],
  subscribers: [],
});


export { OrmConfig };
