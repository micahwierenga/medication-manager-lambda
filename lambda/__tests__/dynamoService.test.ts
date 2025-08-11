import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDB, ScanCommand } from '@aws-sdk/client-dynamodb';

const ddbMock = mockClient(DynamoDB);

import { getAllPatients } from '../services/dynamoService';

describe('dynamoService', () => {
  beforeEach(() => {
    process.env.PATIENTS_TABLE = 'TestPatientsTable';
    ddbMock.reset();
  });

  it('getAllPatients returns patients', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [
        { id: { S: '1' }, firstName: { S: 'John' }, lastName: { S: 'Doe' } }
      ]
    });
    const patients = await getAllPatients();
    expect(patients).toEqual([
      { id: '1', firstName: 'John', lastName: 'Doe' }
    ]);
  });
});