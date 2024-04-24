import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { addDocumentation } from "./startups/docs";

dotenv.config();

export const app = express();
const port = process.env.PORT as string;
app.use(express.json());

app.use(cors({ origin: "*" }));

addDocumentation(app);
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("Knights Ecommerce API");
});
app.use(router)
export const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
})
