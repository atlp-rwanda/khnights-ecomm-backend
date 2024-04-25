"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_utils_1 = require("../utils/response.utils");
const router = (0, express_1.Router)();
router.get("/status", (req, res) => {
    return (0, response_utils_1.responseSuccess)(res, 202, "This is a testing route that returns: 201");
});
// All routes should be imported here and get export after specifying first route
// example router.use("/stock". stockRoutes) =>:: First import stockRoutes and use it here, This shows how the route export will be handled
exports.default = router;
