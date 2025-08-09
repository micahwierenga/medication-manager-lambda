"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiTableApiStack = void 0;
const aws_cdk_lib_1 = require("aws-cdk-lib");
class MultiTableApiStack extends aws_cdk_lib_1.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // DynamoDB tables
        const patientsTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'patients', {
            partitionKey: { name: 'id', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST
        });
        const medicationsTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'medications', {
            partitionKey: { name: 'id', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST
        });
        const medicationSchedulesTable = new aws_cdk_lib_1.aws_dynamodb.Table(this, 'medicationSchedules', {
            partitionKey: { name: 'id', type: aws_cdk_lib_1.aws_dynamodb.AttributeType.STRING },
            removalPolicy: aws_cdk_lib_1.RemovalPolicy.DESTROY,
            billingMode: aws_cdk_lib_1.aws_dynamodb.BillingMode.PAY_PER_REQUEST
        });
        // Lambda function
        const apiLambda = new aws_cdk_lib_1.aws_lambda.Function(this, 'MultiTableLambda', {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.NODEJS_18_X,
            handler: 'index.handler',
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset('lambda'),
            timeout: aws_cdk_lib_1.Duration.seconds(10),
            environment: {
                PATIENTS_TABLE: patientsTable.tableName,
                MEDICATIONS_TABLE: medicationsTable.tableName,
                MEDICATION_SCHEDULES_TABLE: medicationSchedulesTable.tableName,
            }
        });
        // Grant Lambda access to tables
        patientsTable.grantReadData(apiLambda);
        medicationsTable.grantReadData(apiLambda);
        medicationSchedulesTable.grantReadWriteData(apiLambda);
        // API Gateway
        const api = new aws_cdk_lib_1.aws_apigateway.RestApi(this, 'MultiTableAPI', {
            restApiName: 'Multi Table API',
            deployOptions: {
                stageName: 'dev'
            },
        });
        // patients resources
        const patientsResource = api.root.addResource('patients');
        // GET /patients
        patientsResource.addMethod('GET', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(apiLambda));
        // GET /patients/{id}
        patientsResource.addResource('{id}')
            .addMethod('GET', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(apiLambda));
        // medications resource
        const medicationsResource = api.root.addResource('medications');
        // GET /medications
        medicationsResource.addMethod('GET', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(apiLambda));
        // medicationSchedules resources
        const medicationSchedulesResource = api.root.addResource('medicationSchedules');
        // POST /medicationSchedules
        medicationSchedulesResource.addMethod('POST', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(apiLambda));
        // CORS OPTIONS for /medicationSchedules
        medicationSchedulesResource.addMethod('OPTIONS', new aws_cdk_lib_1.aws_apigateway.MockIntegration({
            integrationResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,POST'",
                    },
                }],
            passthroughBehavior: aws_cdk_lib_1.aws_apigateway.PassthroughBehavior.NEVER,
            requestTemplates: { 'application/json': '{"statusCode":200}' },
        }), {
            methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Access-Control-Allow-Headers': true,
                        'method.response.header.Access-Control-Allow-Methods': true,
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                }],
        });
        // PUT /medicationSchedules/{id}
        medicationSchedulesResource.addResource('{id}')
            .addMethod('PUT', new aws_cdk_lib_1.aws_apigateway.LambdaIntegration(apiLambda));
    }
}
exports.MultiTableApiStack = MultiTableApiStack;
