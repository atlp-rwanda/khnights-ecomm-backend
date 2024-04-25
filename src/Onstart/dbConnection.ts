
// Set up databae connection

import { createConnection } from "typeorm";

const dbConnection = async () => {

    const PORT = process.env.PORT;
    const DB_HOST = process.env.DB_HOST;
    const DB_USER = process.env.DB_USER;
    const DB_PASS = process.env.DB_PASS;
    const DB_NAME = process.env.DB_NAME;

    if (!PORT) {
        let port = 8080;
    }

    if (!DB_HOST) {
        let dbHost = "localhost";
    }
    if (!DB_USER) {
        let dbUser = "test";
    }

    if (!DB_PASS) {
        let dbPass = "test";
    }

    if (!DB_NAME) {
        let dbName = "test";
    }

    try {
        await createConnection();
        console.log("[db]: Database connected successfully");
    } catch (error) {
        console.log("[db]: Database connection failed");
        console.log(error);
    }
}

export { dbConnection };
