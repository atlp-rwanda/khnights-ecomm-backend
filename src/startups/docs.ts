import { type Express } from "express";
import swaggerUI from "swagger-ui-express";
import swagger from "../configs/swagger";

export const addDocumentation = (app: Express): void => {
  app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swagger));
};
