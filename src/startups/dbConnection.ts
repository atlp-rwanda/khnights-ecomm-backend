import { OrmConfig } from '../configs/db_config';

const dbConnection = async () => {
  try {
    await OrmConfig.initialize();
    console.log('[db]: Database connected successfully');
  } catch (error) {
    console.log('[db]: Database connection failed');
    console.log(error);
  }
};

export { dbConnection };
