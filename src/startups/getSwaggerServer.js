"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwaggerServer = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
function getSwaggerServer() {
    if (process.env.SWAGGER_SERVER !== undefined) {
        return process.env.SWAGGER_SERVER;
    }
    return 'http://localhost:7000/api/v1';
}
exports.getSwaggerServer = getSwaggerServer;
