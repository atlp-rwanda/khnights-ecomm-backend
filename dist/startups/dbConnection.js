"use strict";
// Set up databae connection
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const typeorm_1 = require("typeorm");
const dbConnection = () => __awaiter(void 0, void 0, void 0, function* () {
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
        yield (0, typeorm_1.createConnection)();
        console.log("[db]: Database connected successfully");
    }
    catch (error) {
        console.log("[db]: Database connection failed");
        console.log(error);
    }
});
exports.dbConnection = dbConnection;
