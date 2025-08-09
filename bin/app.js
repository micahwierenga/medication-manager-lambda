"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aws_cdk_lib_1 = require("aws-cdk-lib");
const multi_table_api_stack_1 = require("../lib/multi-table-api-stack");
const app = new aws_cdk_lib_1.App();
new multi_table_api_stack_1.MultiTableApiStack(app, 'MultiTableApiStack');
