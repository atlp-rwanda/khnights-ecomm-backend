"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrmConfig = void 0;
var typeorm_1 = require("typeorm");
var PORT = process.env.DEV_DB_PORT;
var DB_HOST = process.env.DEV_DB_HOST;
var DB_USER = process.env.DEV_DB_USER;
var DB_PASS = process.env.DEV_DB_PASS;
var DB_NAME = process.env.DEV_DB_NAME;
var DEV_DB_TYPE = process.env.DEV_DB_TYPE;
var port = PORT ? Number(PORT) : 5432;
var dbHost = DB_HOST ? DB_HOST : "localhost";
var dbUser = DB_USER ? DB_USER : "test";
var dbPass = DB_PASS ? DB_PASS : "test";
var dbName = DB_NAME ? DB_NAME : "test";
var dbType = DEV_DB_TYPE ? DEV_DB_TYPE : "postgres";
var OrmConfig = new typeorm_1.DataSource({
    type: dbType,
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
    // extra: {
    //   ssl: {
    //     rejectUnauthorized: false,
    //   },
    // },
});
exports.OrmConfig = OrmConfig;
