// Use case for getting all appointments with filtering and pagination
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import {
  GetAllAppointmentsParams,
  GetAllAppointmentsResponse,
  createLogger,
  ValidationError,
} from '@rimac/shared';

const logger = createLogger('GetAllAppointmentsUseCase');

export class GetAllAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(
    params?: GetAllAppointmentsParams,
    requestId?: string
  ): Promise<GetAllAppointmentsResponse> {
    logger.info('Getting all appointments with filters', { params }, requestId);

    try {
      // 1. Validate parameters
      const validatedParams = this.validateParams(params);

      // 2. Find appointments in repository
      const result = await this.appointmentRepository.findAll(validatedParams);

      logger.info(
        'Retrieved appointments from repository',
        {
          filters: validatedParams,
          count: result.appointments.length,
          total: result.total,
          hasMore: result.hasMore,
        },
        requestId
      );

      // 3. Convert to records for response
      const appointmentRecords = result.appointments.map(appointment => appointment.toRecord());

      // 4. Build response
      const response: GetAllAppointmentsResponse = {
        appointments: appointmentRecords,
        total: result.total,
        limit: validatedParams.limit || 20,
        offset: validatedParams.offset || 0,
        hasMore: result.hasMore,
      };

      logger.info(
        'All appointments retrieved successfully',
        {
          filters: validatedParams,
          returned: response.appointments.length,
          total: response.total,
          hasMore: response.hasMore,
        },
        requestId
      );

      return response;
    } catch (error) {
      logger.error('Failed to get all appointments', error, requestId);
      throw error;
    }
  }

  private validateParams(params?: GetAllAppointmentsParams): GetAllAppointmentsParams {
    if (!params) {
      return {};
    }

    const validated: GetAllAppointmentsParams = {};

    // Validate countryISO
    if (params.countryISO) {
      if (!['PE', 'CL'].includes(params.countryISO)) {
        throw new ValidationError("countryISO must be either 'PE' or 'CL'");
      }
      validated.countryISO = params.countryISO;
    }

    // Validate status
    if (params.status) {
      if (!['pending', 'completed', 'failed'].includes(params.status)) {
        throw new ValidationError("status must be one of: 'pending', 'completed', 'failed'");
      }
      validated.status = params.status;
    }

    // Validate limit
    if (params.limit !== undefined) {
      const limit = Number(params.limit);
      if (isNaN(limit) || limit < 1 || limit > 100) {
        throw new ValidationError('limit must be between 1 and 100');
      }
      validated.limit = limit;
    }

    // Validate offset
    if (params.offset !== undefined) {
      const offset = Number(params.offset);
      if (isNaN(offset) || offset < 0) {
        throw new ValidationError('offset must be 0 or greater');
      }
      validated.offset = offset;
    }

    return validated;
  }
}
