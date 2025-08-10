import { v4 as uuidv4 } from 'uuid';
import { respond } from './utils';
import {
  getAllPatients,
  getPatientById,
  getAvailableMedications,
  getMedicationSchedulesByPatientId,
  addMedicationSchedule,
  toggleMedicationScheduleStatus
} from './services/dynamoService';

export const router = async (
  event: any
) => {
  const { method, path } = event.requestContext.http;

  let id: string | undefined = event.pathParameters?.id;
  if (!id && path.split('/').length > 2) {
    id = path.split('/')[2];
  }
  const body: any = event.body ? JSON.parse(event.body) : null;

  const resource: string = path.split('/')[1];

  try {
    if (resource === 'medications' && method === 'GET') {
      const medications = await getAvailableMedications();

      return respond(200, { medications });
    } else if (resource === 'patients' && method === 'GET' && !id) {
      const patients = await getAllPatients();

      return respond(200, { patients });
    } else if (resource === 'patients' && method === 'GET' && !!id) {
      const patient = await getPatientById(id);
      const schedules = await getMedicationSchedulesByPatientId(id);

      if (patient) {
        patient.medicationSchedules = schedules;
      }

      return patient ? respond(200, patient) : respond(404, { error: 'Not found' });
    } else if (resource === 'medicationSchedules' && method === 'POST') {
      const schedule = { id: uuidv4(), ...body };

      await addMedicationSchedule(schedule);

      return respond(201, schedule);
    } else if (resource === 'medicationSchedules' && method === 'PUT' && !!id) {
      const updatedSchedule = await toggleMedicationScheduleStatus(id);

      return updatedSchedule ? respond(200, updatedSchedule) : respond(404, { error: 'Not found' });
    } else {
      return respond(400, { error: 'Unsupported route or method' });
    }
  } catch (error) {
    console.error('Error details:', JSON.stringify(error, null, 2));

    return respond(500, { error: 'Internal Server Error' });
  }
}