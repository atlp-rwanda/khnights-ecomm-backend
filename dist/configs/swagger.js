"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const getSwaggerServer_1 = require("../startups/getSwaggerServer");
const swaggerServer = (0, getSwaggerServer_1.getSwaggerServer)();
const options = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Knights E-commerce API Documentation",
            version: "1.0.0",
            description: "knights E-commerce - Backend API",
        },
        servers: [{ url: swaggerServer }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./src/docs/*.ts", "./src/docs/*.yml"],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
