import {
  Stack,
  StackProps,
  Duration,
  RemovalPolicy,
  aws_lambda as lambda,
  aws_apigateway as apigateway,
  aws_dynamodb as dynamodb
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class MultiTableApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB tables
    const patientsTable = new dynamodb.Table(this, 'patients', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });
    const medicationsTable = new dynamodb.Table(this, 'medications', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });
    const medicationSchedulesTable = new dynamodb.Table(this, 'medicationSchedules', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
    });

    // Lambda function
    const apiLambda = new lambda.Function(this, 'MultiTableLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist/lambda'),
      timeout: Duration.seconds(10),
      environment: {
        PATIENTS_TABLE: patientsTable.tableName,
        MEDICATIONS_TABLE: medicationsTable.tableName,
        MEDICATION_SCHEDULES_TABLE: medicationSchedulesTable.tableName,
        API_KEY: 'xgUioasWVzPohVlMaSXSu9S8EkhLJNHk1wF3HgWt0h7IkmQyc55MDzsMZ3jUFvMi', // Set your API key here
      }
    });

    // Grant Lambda access to tables
    patientsTable.grantReadData(apiLambda);
    medicationsTable.grantReadData(apiLambda);
    medicationSchedulesTable.grantReadWriteData(apiLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'MultiTableAPI', {
      restApiName: 'Multi Table API',
      deployOptions: {
        stageName: 'dev'
      },
    });

    // patients resources
    const patientsResource = api.root.addResource('patients');
    // GET /patients
    patientsResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    // GET /patients/{id}
    patientsResource.addResource('{id}')
      .addMethod('GET', new apigateway.LambdaIntegration(apiLambda));

    // medications resource
    const medicationsResource = api.root.addResource('medications');
    // GET /medications
    medicationsResource.addMethod('GET', new apigateway.LambdaIntegration(apiLambda));
    
    // medicationSchedules resources
    const medicationSchedulesResource = api.root.addResource('medicationSchedules');
    // POST /medicationSchedules
    medicationSchedulesResource.addMethod('POST', new apigateway.LambdaIntegration(apiLambda));

    // PUT /medicationSchedules/{id}
    medicationSchedulesResource.addResource('{id}')
      .addMethod('PUT', new apigateway.LambdaIntegration(apiLambda));
  }
}
