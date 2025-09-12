// Use case for updating appointment status
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { AppointmentStatus, NotFoundError, ValidationError, createLogger } from '@rimac/shared';

const logger = createLogger('UpdateAppointmentStatusUseCase');

export class UpdateAppointmentStatusUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    appointmentId: string,
    status: AppointmentStatus,
    requestId?: string
  ): Promise<void> {
    logger.info('Updating appointment status', { appointmentId, status }, requestId);

    try {
      // 1. Validate status
      const validStatuses: AppointmentStatus[] = ['pending', 'completed', 'failed'];
      if (!validStatuses.includes(status)) {
        logger.warn('Invalid status provided', { status }, requestId);
        throw new ValidationError(`Invalid status: ${status}`);
      }

      // 2. Check if appointment exists
      const exists = await this.appointmentRepository.exists(appointmentId);
      if (!exists) {
        logger.warn('Appointment not found', { appointmentId }, requestId);
        throw new NotFoundError('Appointment not found');
      }

      // 3. Update status in repository
      await this.appointmentRepository.updateStatus(appointmentId, status);

      logger.info(
        'Appointment status updated successfully',
        {
          appointmentId,
          status,
        },
        requestId
      );
    } catch (error) {
      logger.error('Failed to update appointment status', error, requestId);
      throw error;
    }
  }
}
