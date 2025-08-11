import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDB, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';

const ddbMock = mockClient(DynamoDB);

import { getAllPatients, getPatientById, getAvailableMedications, getMedicationSchedulesByPatientId, addMedicationSchedule, toggleMedicationScheduleStatus } from '../services/dynamoService';

describe('dynamoService', () => {
  beforeEach(() => {
    process.env.PATIENTS_TABLE = 'TestPatientsTable';
    ddbMock.reset();
  });

  it('getAllPatients returns patients', async () => {
    ddbMock.onAnyCommand().resolves({
      Items: [
        { id: { S: '1' }, firstName: { S: 'John' }, lastName: { S: 'Doe' } }
      ]
    });
    const patients = await getAllPatients();
    expect(patients).toEqual([
      { id: '1', firstName: 'John', lastName: 'Doe' }
    ]);
  });

  it('getAllPatients returns empty array when no patients', async () => {
    ddbMock.onAnyCommand().resolves({
      Items: []
    });
    const patients = await getAllPatients();
    expect(patients).toEqual([]);
  });

  it('getAllPatients handles DynamoDB errors', async () => {
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(getAllPatients()).rejects.toThrow('DynamoDB error');
  });

  it('getPatientById returns patient by ID', async () => {
    const id = '1';
    ddbMock.onAnyCommand().resolves({
      Item: { id: { S: id }, firstName: { S: 'John' }, lastName: { S: 'Doe' } }
    });
    const patient = await getPatientById(id);
    expect(patient).toEqual({ id, firstName: 'John', lastName: 'Doe' });
  });

  it('getPatientById returns null for non-existent ID', async () => {
    const id = '999';
    ddbMock.onAnyCommand().resolves({ Items: [] });
    const patient = await getPatientById(id);
    expect(patient).toBeNull();
  });

  it('getPatientById handles DynamoDB errors', async () => {
    const id = '1';
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(getPatientById(id)).rejects.toThrow('DynamoDB error');
  });

  it('getAvailableMedications returns medications', async () => {
    ddbMock.onAnyCommand().resolves({
      Items: [
        { id: { S: '1' }, name: { S: 'Medication A' } }
      ]
    });
    const medications = await getAvailableMedications();
    expect(medications).toEqual([
      { id: '1', name: 'Medication A' }
    ]);
  });

  it('getAvailableMedications handles DynamoDB errors', async () => {
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(getAvailableMedications()).rejects.toThrow('DynamoDB error');
  });

  it('getMedicationSchedulesByPatientId returns schedules for patient', async () => {
    const patientId = '1';
    ddbMock.onAnyCommand().resolves({
      Items: [
        { id: { S: '1' }, patientId: { S: patientId }, medicationId: { S: 'med1' }, medicationName: { S: 'Med A' }, date: { S: '2023-01-01' }, dosage: { S: '10mg' }, completed: { BOOL: true } }
      ]
    });
    const schedules = await getMedicationSchedulesByPatientId(patientId);
    expect(schedules).toEqual([
      { id: '1', patientId, medicationId: 'med1', medicationName: 'Med A', date: '2023-01-01', dosage: '10mg', completed: true }
    ]);
  });

  it('getMedicationSchedulesByPatientId handles DynamoDB errors', async () => {
    const patientId = '1';
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(getMedicationSchedulesByPatientId(patientId)).rejects.toThrow('DynamoDB error');
  });

  it('addMedicationSchedule adds a new schedule', async () => {
    const schedule = { id: '1', patientId: '1', medicationId: 'med1', medicationName: 'Med A', date: '2023-01-01', dosage: '10mg', completed: false };
    ddbMock.onAnyCommand().resolves({});
    await addMedicationSchedule(schedule);
    expect(ddbMock.commandCalls(PutItemCommand).length).toBe(1);
  });

  it('addMedicationSchedule handles DynamoDB errors', async () => {
    const schedule = { id: '1', patientId: '1', medicationId: 'med1', medicationName: 'Med A', date: '2023-01-01', dosage: '10mg', completed: false };
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(addMedicationSchedule(schedule)).rejects.toThrow('DynamoDB error');
  });

  it('toggleMedicationScheduleStatus toggles schedule status', async () => {
    const id = '1';

    ddbMock.onAnyCommand()
      .resolvesOnce({ Item: { completed: { BOOL: false }, id: { S: id }, patientId: { S: '1' }, medicationId: { S: 'med1' }, medicationName: { S: 'Med A' }, date: { S: '2023-01-01' }, dosage: { S: '10mg' } } }) // first getItem
      .resolvesOnce({}) // updateItem
      .resolvesOnce({ Item: { completed: { BOOL: true }, id: { S: id }, patientId: { S: '1' }, medicationId: { S: 'med1' }, medicationName: { S: 'Med A' }, date: { S: '2023-01-01' }, dosage: { S: '10mg' } } }); // second getItem

    const updatedSchedule = await toggleMedicationScheduleStatus(id);
    expect(updatedSchedule).toEqual({
      id,
      patientId: '1',
      medicationId: 'med1',
      medicationName: 'Med A',
      date: '2023-01-01',
      dosage: '10mg',
      completed: true
    });
  });

  it('toggleMedicationScheduleStatus handles DynamoDB errors', async () => {
    const id = '1';
    ddbMock.onAnyCommand().rejects(new Error('DynamoDB error'));
    await expect(toggleMedicationScheduleStatus(id)).rejects.toThrow('DynamoDB error');
  });
});