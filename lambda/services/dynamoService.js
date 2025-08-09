"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeMedicationSchedule = exports.addMedicationSchedule = exports.getMedicationSchedulesByPatientId = exports.getAvailableMedications = exports.getPatientById = exports.getAllPatients = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const dynamo = new client_dynamodb_1.DynamoDB();
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
const getAllPatients = async () => {
    const tableName = process.env.PATIENTS_TABLE;
    const result = await dynamo.scan({ TableName: tableName });
    return result.Items ? result.Items.map(item => ({
        id: item.id.S ?? '',
        firstName: item.firstName.S ?? '',
        lastName: item.lastName.S ?? '',
    })) : [];
};
exports.getAllPatients = getAllPatients;
const getPatientById = async (id) => {
    const tableName = process.env.PATIENTS_TABLE;
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
};
exports.getPatientById = getPatientById;
const getAvailableMedications = async () => {
    const tableName = process.env.MEDICATIONS_TABLE;
    const result = await dynamo.scan({ TableName: tableName });
    return result.Items ? result.Items.map(item => ({
        id: item.id.S ?? '',
        name: item.name.S ?? '',
    })) : [];
};
exports.getAvailableMedications = getAvailableMedications;
const getMedicationSchedulesByPatientId = async (patientId) => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE;
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
};
exports.getMedicationSchedulesByPatientId = getMedicationSchedulesByPatientId;
const addMedicationSchedule = async (schedule) => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE;
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
};
exports.addMedicationSchedule = addMedicationSchedule;
const completeMedicationSchedule = async (id) => {
    const tableName = process.env.MEDICATION_SCHEDULES_TABLE;
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
};
exports.completeMedicationSchedule = completeMedicationSchedule;
