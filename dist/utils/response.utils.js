"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseServerError = exports.responseError = exports.responseSuccess = void 0;
const jsend_1 = __importDefault(require("jsend"));
const responseSuccess = (res, status_code, message, data) => {
    return res.status(200).json(jsend_1.default.success({
        code: status_code,
        message,
        data,
    }));
};
exports.responseSuccess = responseSuccess;
const responseError = (res, status_code, message, data) => {
    return res.status(400).json(jsend_1.default.error({
        code: status_code,
        message,
        data,
    }));
};
exports.responseError = responseError;
const responseServerError = (res, error) => {
    return res.status(500).json(jsend_1.default.error({
        code: 999,
        message: `There is a problem with the server!: ${error}`,
    }));
};
exports.responseServerError = responseServerError;
