// Types for appointment management system

export interface AppointmentRequest {
  insuredId: string;
  scheduleId: number;
  countryISO: 'PE' | 'CL';
}

export interface AppointmentRecord {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: 'PE' | 'CL';
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
  ttl?: number; // DynamoDB TTL
}

export interface ScheduleDetails {
  scheduleId: number;
  centerId: number;
  specialtyId: number;
  medicId: number;
  date: string; // ISO 8601 format
}

export interface EnrichedAppointment extends AppointmentRecord {
  doctorId?: number;
  doctorName?: string;
  specialtyId?: number;
  specialtyName?: string;
  medicalCenterId?: number;
  centerName?: string;
  centerAddress?: string;
  appointmentCost?: number;
  currency?: string;
  taxRate?: number;
  processedAt?: string;
  processingLambda?: string;
}

export type AppointmentStatus = 'pending' | 'completed' | 'failed';

export type CountryCode = 'PE' | 'CL';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string | undefined;
  error?: string | undefined;
}

export interface CreateAppointmentResponse {
  id: string;
  message: string;
  status: AppointmentStatus;
}

export interface GetAppointmentsResponse {
  appointments: AppointmentRecord[];
  total: number;
}

export interface GetAllAppointmentsResponse {
  appointments: AppointmentRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface GetAllAppointmentsParams {
  countryISO?: CountryCode;
  status?: AppointmentStatus;
  limit?: number;
  offset?: number;
}
