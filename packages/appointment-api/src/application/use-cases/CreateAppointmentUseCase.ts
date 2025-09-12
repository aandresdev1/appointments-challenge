// Use case for creating a new appointment
import { v4 as uuidv4 } from 'uuid';
import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { IMessagingService } from '../interfaces/IMessagingService';
import {
  AppointmentRequest,
  CreateAppointmentResponse,
  validateAppointmentRequest,
  getCurrentTimestamp,
  getTTL,
  ValidationError,
  ConflictError,
  createLogger,
} from '@rimac/shared';

const logger = createLogger('CreateAppointmentUseCase');

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private messagingService: IMessagingService
  ) {}

  async execute(
    request: AppointmentRequest,
    requestId?: string
  ): Promise<CreateAppointmentResponse> {
    logger.info('Creating new appointment', { request }, requestId);

    try {
      // 1. Validate request
      const validationResult = validateAppointmentRequest(request);
      if (!validationResult.isValid) {
        logger.warn('Validation failed', { errors: validationResult.errors }, requestId);
        throw new ValidationError(
          `Validation failed: ${validationResult.errors?.map((e: any) => e.message).join(', ')}`
        );
      }

      // 2. Create appointment entity
      const appointmentId = uuidv4();
      const now = getCurrentTimestamp();
      const ttl = getTTL(30); // 30 days TTL

      const appointment = new Appointment(
        appointmentId,
        request.insuredId,
        request.scheduleId,
        request.countryISO,
        now,
        'pending',
        undefined,
        ttl
      );

      // 3. Check if appointment already exists (business rule)
      const existingAppointment = await this.appointmentRepository.findById(appointmentId);
      if (existingAppointment) {
        logger.warn('Appointment already exists', { appointmentId }, requestId);
        throw new ConflictError('Appointment already exists');
      }

      // 4. Save to repository (DynamoDB)
      await this.appointmentRepository.save(appointment);
      logger.info('Appointment saved to repository', { appointmentId }, requestId);

      // 5. Publish to messaging service (SNS) - ENABLED FOR PE FLOW
      await this.messagingService.publishAppointmentCreated(appointment, requestId);
      logger.info('Appointment published to messaging service', { appointmentId }, requestId);

      // 6. Return response
      const response: CreateAppointmentResponse = {
        id: appointmentId,
        message: 'Appointment creation is being processed',
        status: 'pending',
      };

      logger.info('Appointment created successfully', { response }, requestId);
      return response;
    } catch (error) {
      logger.error('Failed to create appointment', error, requestId);
      throw error;
    }
  }
}
