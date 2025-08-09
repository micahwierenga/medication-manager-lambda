import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { BaseItem } from '../types';

const dynamo = new DynamoDB();

// export const getItem = async (tableName: string, id: string): Promise<BaseItem | null> => {
//     const result = await dynamo.getItem({
//         TableName: tableName,
//         Key: {
//             id: { S: id },
//         },
//     });
//     return result.Item ? {
//         id: result.Item.id.S ?? '',
//         ...Object.fromEntries(Object.entries(result.Item).filter(([key]) => key !== 'id').map(([key, value]) => [key, value.S])),
//     } : null;
// }

// export const putItem = async (tableName: string, item: BaseItem): Promise<void> => {
//     await dynamo.putItem({
//         TableName: tableName,
//         Item: {
//             id: { S: item.id },
//             // TODO: make sort key dynamic based on table structure
//             "lastName#firstName": { S: `${item.lastName}#${item.firstName}` },
//             ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => [key, { S: value }])),
//         },
//     });
// }

// export const deleteItem = async (tableName: string, id: string): Promise<void> => {
//     await dynamo.deleteItem({
//         TableName: tableName,
//         Key: {
//             id: { S: id },
//         },
//     });
// }

// export const scanTable = async (tableName: string): Promise<BaseItem[]> => {
//     const result = await dynamo.scan({ TableName: tableName });
//     return result.Items ? result.Items.map(item => ({
//         id: item.id.S ?? '',
//         ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => [key, value.S])),
//     })) : [];
// }

// export const updateItem = async (tableName: string, item: BaseItem): Promise<void> => {
//     await dynamo.updateItem({
//         TableName: tableName,
//         Key: {
//             id: { S: item.id },
//         },
//         UpdateExpression: 'set ' + Object.keys(item).filter(key => key !== 'id').map(key => `${key} = :${key}`).join(', '),
//         ExpressionAttributeValues: Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id').map(([key, value]) => [`:${key}`, { S: value }])),
//     });
// }

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

export const completeMedicationSchedule = async (id: string): Promise<void> => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE!;
    await dynamo.updateItem({
        TableName: tableName,
        Key: {
            id: { S: id },
        },
        UpdateExpression: 'set completed = :completed',
        ExpressionAttributeValues: {
            ':completed': { BOOL: true },
        },
    });
}