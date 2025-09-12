// Use case for getting appointments by insured ID
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import {
  GetAppointmentsResponse,
  NotFoundError,
  createLogger,
  sanitizeInsuredId,
} from '@rimac/shared';

const logger = createLogger('GetAppointmentsByInsuredUseCase');

export class GetAppointmentsByInsuredUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(insuredId: string, requestId?: string): Promise<GetAppointmentsResponse> {
    logger.info('Getting appointments by insured ID', { insuredId }, requestId);

    try {
      // 1. Sanitize and validate insured ID
      const sanitizedInsuredId = sanitizeInsuredId(insuredId);

      if (!sanitizedInsuredId || sanitizedInsuredId.length !== 5) {
        logger.warn('Invalid insured ID format', { insuredId, sanitizedInsuredId }, requestId);
        throw new NotFoundError('Invalid insured ID format');
      }

      // 2. Find appointments in repository
      const appointments = await this.appointmentRepository.findByInsuredId(sanitizedInsuredId);

      logger.info(
        'Retrieved appointments from repository',
        {
          insuredId: sanitizedInsuredId,
          count: appointments.length,
        },
        requestId
      );

      // 3. Convert to records for response
      const appointmentRecords = appointments.map((appointment: Appointment) =>
        appointment.toRecord()
      );

      // 4. Build response
      const response: GetAppointmentsResponse = {
        appointments: appointmentRecords,
        total: appointmentRecords.length,
      };

      logger.info(
        'Appointments retrieved successfully',
        {
          insuredId: sanitizedInsuredId,
          total: response.total,
        },
        requestId
      );

      return response;
    } catch (error) {
      logger.error('Failed to get appointments by insured ID', error, requestId);
      throw error;
    }
  }
}
