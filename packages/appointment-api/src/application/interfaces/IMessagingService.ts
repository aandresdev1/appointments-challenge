// Messaging service interface
import { Appointment } from '../../domain/entities/Appointment';

export interface IMessagingService {
  /**
   * Publish appointment created event to SNS
   */
  publishAppointmentCreated(appointment: Appointment, requestId?: string): Promise<void>;

  /**
   * Publish appointment updated event to SNS
   */
  publishAppointmentUpdated(appointment: Appointment, requestId?: string): Promise<void>;
}
