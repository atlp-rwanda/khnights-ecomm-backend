
import { createConnection } from "typeorm";

const dbConnection = async () => {
  try {
    const connection = await createConnection();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};
export { dbConnection };
