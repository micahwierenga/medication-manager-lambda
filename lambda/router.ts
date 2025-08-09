import { v4 as uuidv4 } from 'uuid';
// import { TableMap } from './types';
import { respond } from './utils';
import {
  getAllPatients,
  getPatientById,
  getAvailableMedications,
  getMedicationSchedulesByPatientId,
  addMedicationSchedule,
  completeMedicationSchedule
} from './services/dynamoService';

// const tableMap: TableMap = {
//     patients: process.env.PATIENTS_TABLE!,
//     medications: process.env.MEDICATIONS_TABLE!,
//     medicationSchedules: process.env.MEDICATION_SCHEDULES_TABLE!,
// };

export const handleRequest = async (
  event: any
) => {
  console.log('Received event:', typeof event, JSON.stringify(event, null, 2));

  const { method, path } = event.requestContext.http;

  let id: string | undefined = event.pathParameters?.id;
  if (!id && path.split('/').length > 2) {
    id = path.split('/')[2];
  }
  const body: any = event.body ? JSON.parse(event.body) : null;

  const resource: string = path.split('/')[1];
  // const tableName: string = tableMap[resource];
  // if (!tableName) {
  //     return respond(400, `Resource "${resource}" not found`);
  // }

  try {
    if (resource === 'medications' && method === 'GET') {
      console.log('Fetching available medications');
      const medications = await getAvailableMedications();
      console.log('Available medications:', medications);
      return respond(200, { medications });
    } else if (resource === 'patients' && method === 'GET' && !id) {
      console.log('Fetching all patients');
      const patients = await getAllPatients();
      console.log('All patients:', patients);
      return respond(200, { patients });
    } else if (resource === 'patients' && method === 'GET' && !!id) {
      console.log('Fetching patient with ID:', id);
      const patient = await getPatientById(id);
      console.log('Patient details:', patient);
      console.log('Getting medication schedules with patient ID:', id);
      const schedules = await getMedicationSchedulesByPatientId(id);
      console.log('Medication schedules:', schedules);
      if (patient) {
        patient.medicationSchedules = schedules;
      }
      return patient ? respond(200, patient) : respond(404, { error: 'Not found' });
    } else if (resource === 'medicationSchedules' && method === 'POST') {
      console.log('Adding medication schedule');
      const schedule = { id: uuidv4(), ...body };
      console.log('New medication schedule:', schedule);
      await addMedicationSchedule(schedule);
      console.log('Medication schedule added:', schedule);
      return respond(201, schedule);
    } else if (resource === 'medicationSchedules' && method === 'PUT' && !!id) {
      console.log('Completing medication schedule with ID:', id);
      await completeMedicationSchedule(id);
      console.log('Medication schedule completed with ID:', id);
      return respond(204);
    } else {
      return respond(400, { error: 'Unsupported route or method' });
    }
  } catch (error) {
    console.error('Error details:', JSON.stringify(error, null, 2));

    return respond(500, { error: 'Internal Server Error' });
  }
}