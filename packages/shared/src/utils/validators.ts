// Validation utilities using Joi

import Joi from 'joi';
import { VALIDATION_PATTERNS, SUPPORTED_COUNTRIES } from '../constants';

// Appointment request validation schema
export const appointmentRequestSchema = Joi.object({
  insuredId: Joi.string().pattern(VALIDATION_PATTERNS.INSURED_ID).required().messages({
    'string.pattern.base': 'insuredId must be exactly 5 digits',
    'any.required': 'insuredId is required',
  }),

  scheduleId: Joi.number().integer().positive().required().messages({
    'number.positive': 'scheduleId must be a positive integer',
    'any.required': 'scheduleId is required',
  }),

  countryISO: Joi.string()
    .valid(...SUPPORTED_COUNTRIES)
    .required()
    .messages({
      'any.only': 'countryISO must be either PE or CL',
      'any.required': 'countryISO is required',
    }),
});

// Validation helper functions
export const validateAppointmentRequest = (data: any) => {
  const { error, value } = appointmentRequestSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    return { isValid: false, errors, data: null };
  }

  return { isValid: true, errors: null, data: value };
};

// Generic validation helper
export const validateRequired = (obj: Record<string, any>, requiredFields: string[]) => {
  const missing = requiredFields.filter(field => !obj[field]);
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
};

// Sanitize insured ID (pad with zeros if needed)
export const sanitizeInsuredId = (insuredId: string): string => {
  const str = String(insuredId);
  if (str.length >= 5) return str;
  return '0'.repeat(5 - str.length) + str;
};
