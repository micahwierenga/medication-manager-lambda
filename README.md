# Medication Manager Lambda

## Policies

In order to successfully deploy the Multi-Table API Stack to AWS, the chosen account must have policies configured to allow actions and resources for the following services:

- CloudFormation
- ECR
- Lambda
- S3

## Setup

Generate a secure api key and set it as the value of the `API_KEY` environment variable in the `multi-table-api-stack.ts` construct.

After confirming thatRun the following commands:

```
npm run build
npm run deploy
```
