import { Request, Response, Router } from "express";
import { responseSuccess } from "../utils/response.utils";
const router = Router();
router.get("/api/v1/status", (req: Request, res: Response) => {
  return responseSuccess(res, 202, "This is a testing route that returns: 201");
});
// All routes should be imported here and get export after specifying first route
// example router.use("/stock". stockRoutes) =>:: First import stockRoutes and use it here, This shows how the route export will be handled

export default router;
