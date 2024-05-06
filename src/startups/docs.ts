import { type Express } from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from '../configs/swagger';
import fs from 'fs';

export const addDocumentation = (app: Express): void => {
  app.use(
    '/api/v1/docs',
    swaggerUI.serve,
    swaggerUI.setup(swaggerSpec, {
      customCss: `
        ${fs.readFileSync('./src/docs/swaggerDark.css')}
      `,
    })
  );
};
