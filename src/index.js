"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = exports.app = void 0;
var express_1 = require("express");
var cors_1 = require("cors");
var dotenv_1 = require("dotenv");
var routes_1 = require("./routes");
var docs_1 = require("./startups/docs");
var errorHandler_1 = require("./middlewares/errorHandler");
var morgan_1 = require("morgan");
var dbConnection_1 = require("./startups/dbConnection");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
var port = process.env.PORT;
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)({ origin: '*' }));
exports.app.use(routes_1.default);
(0, docs_1.addDocumentation)(exports.app);
exports.app.all('*', function (req, res, next) {
    var error = new errorHandler_1.CustomError("Can't find ".concat(req.originalUrl, " on the server!"), 404);
    error.status = 'fail';
    next(error);
});
exports.app.use(errorHandler_1.errorHandler);
// Start database connection
(0, dbConnection_1.dbConnection)();
//morgan
var morganFormat = ':method :url :status :response-time ms - :res[content-length]';
exports.app.use((0, morgan_1.default)(morganFormat));
exports.server = exports.app.listen(port, function () {
    console.log("[server]: Server is running at http://localhost:".concat(port));
});
