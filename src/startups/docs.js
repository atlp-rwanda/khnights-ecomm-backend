"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDocumentation = void 0;
var swagger_ui_express_1 = require("swagger-ui-express");
var swagger_1 = require("../configs/swagger");
var addDocumentation = function (app) {
    app.use('/api/v1/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
};
exports.addDocumentation = addDocumentation;
