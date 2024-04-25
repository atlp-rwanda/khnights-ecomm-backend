"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var swagger_jsdoc_1 = require("swagger-jsdoc");
var getSwaggerServer_1 = require("../startups/getSwaggerServer");
var swaggerServer = (0, getSwaggerServer_1.getSwaggerServer)();
var options = {
    definition: {
        openapi: '3.0.1',
        info: {
            title: 'Knights E-commerce API Documentation',
            version: '1.0.0',
            description: 'knights E-commerce - Backend API',
        },
        servers: [{ url: swaggerServer }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/docs/*.ts', './src/docs/*.yml'],
};
var swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
