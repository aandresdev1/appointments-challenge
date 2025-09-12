// Repository interface for RDS MySQL operations
import { EnrichedAppointment } from '@rimac/shared';

export interface IRDSAppointmentRepository {
  /**
   * Insert enriched appointment data into country-specific RDS
   */
  insertEnrichedAppointment(appointment: EnrichedAppointment): Promise<void>;

  /**
   * Get enriched appointment by ID from RDS
   */
  findEnrichedById(id: string): Promise<EnrichedAppointment | null>;

  /**
   * Get appointments by insured ID with enriched data
   */
  findEnrichedByInsuredId(insuredId: string): Promise<EnrichedAppointment[]>;
}
