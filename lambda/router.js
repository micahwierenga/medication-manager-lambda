"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = void 0;
const uuid_1 = require("uuid");
// import { TableMap } from './types';
const utils_1 = require("./utils");
const dynamoService_1 = require("./services/dynamoService");
// const tableMap: TableMap = {
//     patients: process.env.PATIENTS_TABLE!,
//     medications: process.env.MEDICATIONS_TABLE!,
//     medicationSchedules: process.env.MEDICATION_SCHEDULES_TABLE!,
// };
const handleRequest = async (event) => {
    console.log('Received event:', typeof event, JSON.stringify(event, null, 2));
    const { method, path } = event.requestContext.http;
    let id = event.pathParameters?.id;
    if (!id && path.split('/').length > 2) {
        id = path.split('/')[2];
    }
    const body = event.body ? JSON.parse(event.body) : null;
    const resource = path.split('/')[1];
    // const tableName: string = tableMap[resource];
    // if (!tableName) {
    //     return respond(400, `Resource "${resource}" not found`);
    // }
    try {
        if (resource === 'medications' && method === 'GET') {
            console.log('Fetching available medications');
            const medications = await (0, dynamoService_1.getAvailableMedications)();
            console.log('Available medications:', medications);
            return (0, utils_1.respond)(200, { medications });
        }
        else if (resource === 'patients' && method === 'GET' && !id) {
            console.log('Fetching all patients');
            const patients = await (0, dynamoService_1.getAllPatients)();
            console.log('All patients:', patients);
            return (0, utils_1.respond)(200, { patients });
        }
        else if (resource === 'patients' && method === 'GET' && !!id) {
            console.log('Fetching patient with ID:', id);
            const patient = await (0, dynamoService_1.getPatientById)(id);
            console.log('Patient details:', patient);
            console.log('Getting medication schedules with patient ID:', id);
            const schedules = await (0, dynamoService_1.getMedicationSchedulesByPatientId)(id);
            console.log('Medication schedules:', schedules);
            if (patient) {
                patient.medicationSchedules = schedules;
            }
            return patient ? (0, utils_1.respond)(200, patient) : (0, utils_1.respond)(404, { error: 'Not found' });
        }
        else if (resource === 'medicationSchedules' && method === 'POST') {
            console.log('Adding medication schedule');
            const schedule = { id: (0, uuid_1.v4)(), ...body };
            console.log('New medication schedule:', schedule);
            await (0, dynamoService_1.addMedicationSchedule)(schedule);
            console.log('Medication schedule added:', schedule);
            return (0, utils_1.respond)(201, schedule);
        }
        else if (resource === 'medicationSchedules' && method === 'PUT' && !!id) {
            console.log('Completing medication schedule with ID:', id);
            await (0, dynamoService_1.completeMedicationSchedule)(id);
            console.log('Medication schedule completed with ID:', id);
            return (0, utils_1.respond)(204);
        }
        else {
            return (0, utils_1.respond)(400, { error: 'Unsupported route or method' });
        }
    }
    catch (error) {
        console.error('Error details:', JSON.stringify(error, null, 2));
        return (0, utils_1.respond)(500, { error: 'Internal Server Error' });
    }
};
exports.handleRequest = handleRequest;
