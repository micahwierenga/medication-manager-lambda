import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { BaseItem } from '../types';

const dynamo = new DynamoDB();

export const getAllPatients = async (): Promise<BaseItem[]> => {
    const tableName = process.env.PATIENTS_TABLE!;
    const result = await dynamo.scan({ TableName: tableName });
    return result.Items ? result.Items.map(item => ({
        id: item.id.S ?? '',
        firstName: item.firstName.S ?? '',
        lastName: item.lastName.S ?? '',
    })) : [];
}

export const getPatientById = async (id: string): Promise<BaseItem | null> => {
    const tableName = process.env.PATIENTS_TABLE!;
    const result = await dynamo.getItem({
        TableName: tableName,
        Key: {
            id: { S: id },
        },
    });
    return result.Item ? {
        id: result.Item.id.S ?? '',
        firstName: result.Item.firstName.S ?? '',
        lastName: result.Item.lastName.S ?? '',
    } : null;
}

export const getAvailableMedications = async () : Promise<BaseItem[]> => {
    const tableName = process.env.MEDICATIONS_TABLE!;
    const result = await dynamo.scan({ TableName: tableName });
    return result.Items ? result.Items.map(item => ({
        id: item.id.S ?? '',
        name: item.name.S ?? '',
    })) : [];
}

export const getMedicationSchedulesByPatientId = async (patientId: string): Promise<BaseItem[]> => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE!;
    const result = await dynamo.scan({
        TableName: tableName,
        FilterExpression: 'patientId = :patientId',
        ExpressionAttributeValues: {
            ':patientId': { S: patientId },
        },
    });
    return result.Items ? result.Items.map(item => ({
        id: item.id.S ?? '',
        patientId: item.patientId.S ?? '',
        medicationId: item.medicationId.S ?? '',
        medicationName: item.medicationName.S ?? '',
        date: item.date.S ?? '',
        dosage: item.dosage.S ?? '',
        completed: item.completed.BOOL ?? false,
    })) : [];
}

export const addMedicationSchedule = async (schedule: BaseItem): Promise<void> => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE!;
    await dynamo.putItem({
        TableName: tableName,
        Item: {
            id: { S: schedule.id },
            patientId: { S: schedule.patientId },
            medicationId: { S: schedule.medicationId },
            medicationName: { S: schedule.medicationName },
            date: { S: schedule.date },
            dosage: { S: schedule.dosage },
            completed: { BOOL: schedule.completed ?? false },
        },
    });
}

export const toggleMedicationScheduleStatus = async (id: string): Promise<BaseItem | null> => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE!;

    // Get current completed value
    const result = await dynamo.getItem({
        TableName: tableName,
        Key: { id: { S: id } },
        ProjectionExpression: 'completed'
    });
    const current = result.Item?.completed?.BOOL ?? false;

    // Toggle completed value
    await dynamo.updateItem({
        TableName: tableName,
        Key: { id: { S: id } },
        UpdateExpression: 'set completed = :completed',
        ExpressionAttributeValues: {
            ':completed': { BOOL: !current },
        },
    });

    // Fetch and return the updated item
    const updatedResult = await dynamo.getItem({
        TableName: tableName,
        Key: { id: { S: id } },
    });
    if (!updatedResult.Item) return null;
    // Map DynamoDB item to BaseItem shape
    return {
        id: updatedResult.Item.id?.S ?? '',
        patientId: updatedResult.Item.patientId?.S ?? '',
        medicationId: updatedResult.Item.medicationId?.S ?? '',
        medicationName: updatedResult.Item.medicationName?.S ?? '',
        date: updatedResult.Item.date?.S ?? '',
        dosage: updatedResult.Item.dosage?.S ?? '',
        completed: updatedResult.Item.completed?.BOOL ?? false,
    };
}
