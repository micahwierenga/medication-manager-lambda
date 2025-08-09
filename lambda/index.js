"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const router_1 = require("./router");
const handler = async (event) => {
    return (0, router_1.handleRequest)(event);
};
exports.handler = handler;
