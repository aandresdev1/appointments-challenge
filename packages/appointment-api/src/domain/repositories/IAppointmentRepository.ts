// Repository interface for appointment persistence
import { Appointment } from '../entities/Appointment';
import { CountryCode, GetAllAppointmentsParams } from '@rimac/shared';

export interface FindAllResult {
  appointments: Appointment[];
  total: number;
  hasMore: boolean;
}

export interface IAppointmentRepository {
  /**
   * Save a new appointment
   */
  save(appointment: Appointment): Promise<void>;

  /**
   * Find appointment by ID
   */
  findById(id: string): Promise<Appointment | null>;

  /**
   * Find appointments by insured ID
   */
  findByInsuredId(insuredId: string): Promise<Appointment[]>;

  /**
   * Update appointment status
   */
  updateStatus(id: string, status: 'pending' | 'completed' | 'failed'): Promise<void>;

  /**
   * Find appointments by status
   */
  findByStatus(status: 'pending' | 'completed' | 'failed'): Promise<Appointment[]>;

  /**
   * Find appointments by country
   */
  findByCountry(countryISO: CountryCode): Promise<Appointment[]>;

  /**
   * Find all appointments with optional filtering and pagination
   */
  findAll(params?: GetAllAppointmentsParams): Promise<FindAllResult>;

  /**
   * Check if appointment exists
   */
  exists(id: string): Promise<boolean>;
}
