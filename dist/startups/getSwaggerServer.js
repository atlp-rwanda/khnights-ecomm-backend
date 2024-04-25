"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwaggerServer = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getSwaggerServer() {
    if (process.env.SWAGGER_SERVER !== undefined) {
        return process.env.SWAGGER_SERVER;
    }
    return "http://localhost:7000/api/v1";
}
exports.getSwaggerServer = getSwaggerServer;
