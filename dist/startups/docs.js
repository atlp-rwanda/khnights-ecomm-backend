"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDocumentation = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("../configs/swagger"));
const addDocumentation = (app) => {
    app.use("/api/v1/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
};
exports.addDocumentation = addDocumentation;
