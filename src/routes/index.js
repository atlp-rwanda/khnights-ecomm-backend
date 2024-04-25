"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var response_utils_1 = require("../utils/response.utils");
var router = (0, express_1.Router)();
router.get("/", function (req, res) {
    res.send("Knights Ecommerce API");
});
router.get('/api/v1/status', function (req, res) {
    return (0, response_utils_1.responseSuccess)(res, 202, 'This is a testing route that returns: 201');
});
// All routes should be imported here and get export after specifying first route
// example router.use("/stock". stockRoutes) =>:: First import stockRoutes and use it here, This shows how the route export will be handled
exports.default = router;
