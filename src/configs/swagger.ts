import swaggerJSDoc from 'swagger-jsdoc';
import { getSwaggerServer } from '../startups/getSwaggerServer';

const swaggerServer = getSwaggerServer();

const options: swaggerJSDoc.Options = {
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

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
