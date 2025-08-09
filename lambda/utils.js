"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respond = void 0;
const respond = (statusCode, body) => ({
    statusCode,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : '',
});
exports.respond = respond;
