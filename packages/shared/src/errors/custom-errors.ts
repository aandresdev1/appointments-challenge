// Custom error classes for better error handling

export class AppointmentError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AppointmentError';
    this.code = code;
    this.statusCode = statusCode;

    // Maintains proper stack trace for where our error was thrown
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, AppointmentError);
    }
  }
}

export class ValidationError extends AppointmentError {
  constructor(message: string, field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppointmentError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppointmentError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

export class InternalError extends AppointmentError {
  constructor(message: string, originalError?: Error) {
    super(message, 'INTERNAL_ERROR', 500);
    this.name = 'InternalError';

    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

export class ExternalServiceError extends AppointmentError {
  constructor(service: string, message: string) {
    super(`${service}: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
    this.name = 'ExternalServiceError';
  }
}

// Error codes enum for consistent error identification
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  APPOINTMENT_ALREADY_EXISTS = 'APPOINTMENT_ALREADY_EXISTS',
  INVALID_COUNTRY_CODE = 'INVALID_COUNTRY_CODE',
  INVALID_SCHEDULE_ID = 'INVALID_SCHEDULE_ID',
  DYNAMODB_ERROR = 'DYNAMODB_ERROR',
  SNS_ERROR = 'SNS_ERROR',
  SQS_ERROR = 'SQS_ERROR',
  RDS_ERROR = 'RDS_ERROR',
  EVENTBRIDGE_ERROR = 'EVENTBRIDGE_ERROR',
}
