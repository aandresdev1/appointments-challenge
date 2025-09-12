// AWS Service types and interfaces

import { SQSEvent, SQSRecord, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// SNS Message types
export interface SNSAppointmentMessage {
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: 'PE' | 'CL';
  timestamp: string;
}

// SQS Message types
export interface SQSAppointmentMessage extends SNSAppointmentMessage {
  messageId: string;
  receiptHandle: string;
}

// EventBridge event types
export interface AppointmentCompletionEvent {
  version: string;
  id: string;
  'detail-type': 'Appointment Processed';
  source: 'rimac.appointments';
  account: string;
  time: string;
  region: string;
  detail: {
    appointmentId: string;
    insuredId: string;
    countryISO: 'PE' | 'CL';
    status: 'completed' | 'failed';
    processedBy: string;
    processedAt: string;
  };
}

// Lambda handler types
export type AppointmentAPIHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

export type SQSAppointmentHandler = (event: SQSEvent) => Promise<void>;

// DynamoDB types
export interface DynamoDBAppointmentItem {
  PK: string; // APPT#{id}
  SK: string; // METADATA
  GSI1PK: string; // INSURED#{insuredId}
  GSI1SK: string; // {createdAt}
  id: string;
  insuredId: string;
  scheduleId: number;
  countryISO: 'PE' | 'CL';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  ttl?: number;
}

// RDS types
export interface MySQLAppointmentRecord {
  id: string;
  insured_id: string;
  schedule_id: number;
  doctor_id?: number;
  doctor_name?: string;
  specialty_id?: number;
  specialty_name?: string;
  medical_center_id?: number;
  center_name?: string;
  center_address?: string;
  appointment_date?: string;
  appointment_cost?: number;
  currency?: string;
  tax_rate?: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  country_code: 'PE' | 'CL';
  created_at: string;
  updated_at?: string;
  processed_at: string;
  processing_lambda: string;
}
