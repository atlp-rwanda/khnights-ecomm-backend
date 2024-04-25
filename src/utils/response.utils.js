"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseServerError = exports.responseError = exports.responseSuccess = void 0;
var jsend_1 = require("jsend");
var responseSuccess = function (res, status_code, message, data) {
    return res.status(200).json(jsend_1.default.success({
        code: status_code,
        message: message,
        data: data,
    }));
};
exports.responseSuccess = responseSuccess;
var responseError = function (res, status_code, message, data) {
    return res.status(400).json(jsend_1.default.error({
        code: status_code,
        message: message,
        data: data,
    }));
};
exports.responseError = responseError;
var responseServerError = function (res, error) {
    return res.status(500).json(jsend_1.default.error({
        code: 999,
        message: "There is a problem with the server!: ".concat(error),
    }));
};
exports.responseServerError = responseServerError;
