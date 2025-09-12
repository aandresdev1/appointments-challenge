// Country-specific configurations and constants

export const COUNTRIES = {
  PE: {
    code: 'PE' as const,
    name: 'Peru',
    currency: 'PEN',
    taxRate: 0.18, // IGV Peru
    timezone: 'America/Lima',
    sqsQueue: 'rimac-appointment-pe-queue',
    rdsDatabase: 'appointments_pe',
  },
  CL: {
    code: 'CL' as const,
    name: 'Chile',
    currency: 'CLP',
    taxRate: 0.19, // IVA Chile
    timezone: 'America/Santiago',
    sqsQueue: 'rimac-appointment-cl-queue',
    rdsDatabase: 'appointments_cl',
  },
} as const;

export const SUPPORTED_COUNTRIES = ['PE', 'CL'] as const;

export type CountryConfig = (typeof COUNTRIES)[keyof typeof COUNTRIES];

// Country-specific business rules
export const BUSINESS_RULES = {
  PE: {
    maxAppointmentsPerDay: 10,
    allowedTimeSlots: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    workingDays: [1, 2, 3, 4, 5], // Monday to Friday
    advanceBookingDays: 30,
  },
  CL: {
    maxAppointmentsPerDay: 8,
    allowedTimeSlots: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00'],
    workingDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
    advanceBookingDays: 21,
  },
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  INSURED_ID: /^\d{5}$/, // 5 digits exactly
  SCHEDULE_ID: /^\d+$/, // Positive integers
} as const;
