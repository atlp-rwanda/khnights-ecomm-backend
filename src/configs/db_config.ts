import { DataSource } from "typeorm";

const PORT = process.env.DEV_DB_PORT;
const DB_HOST = process.env.DEV_DB_HOST;
const DB_USER = process.env.DEV_DB_USER;
const DB_PASS = process.env.DEV_DB_PASS;
const DB_NAME = process.env.DEV_DB_NAME;
const DEV_DB_TYPE = process.env.DEV_DB_TYPE;

const port = PORT ? Number(PORT) : 5432;
const dbHost = DB_HOST ? DB_HOST : "localhost";
const dbUser = DB_USER ? DB_USER : "test";
const dbPass = DB_PASS ? DB_PASS : "test";
const dbName = DB_NAME ? DB_NAME : "test";
const dbType = DEV_DB_TYPE ? DEV_DB_TYPE : "postgres";

const OrmConfig = new DataSource({
  type: dbType as any,
  host: dbHost,
  port: port,
  username: dbUser,
  password: dbPass,
  database: dbName,
  synchronize: true,
  logging: false,
  // entities: [
  //     "src/entity/**/*.ts"
  // ],
  // migrations: [
  //     "src/migration/**/*.ts"
  // ],
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});

export { OrmConfig };
