import { App } from 'aws-cdk-lib';
import { MultiTableApiStack } from '../lib/multi-table-api-stack';

const app = new App();
new MultiTableApiStack(app, 'MultiTableApiStack');
