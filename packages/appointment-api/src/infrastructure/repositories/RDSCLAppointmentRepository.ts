// RDS MySQL repository implementation for CL appointments
import mysql from 'mysql2/promise';
import { IRDSAppointmentRepository } from '../../domain/repositories/IRDSAppointmentRepository';
import { EnrichedAppointment, createLogger, InternalError } from '@rimac/shared';

const logger = createLogger('RDSCLRepository');

export class RDSCLAppointmentRepository implements IRDSAppointmentRepository {
  private connectionConfig: mysql.ConnectionOptions;

  constructor() {
    this.connectionConfig = {
      host: process.env.RDS_CL_HOST || 'localhost',
      port: parseInt(process.env.RDS_CL_PORT || '3306'),
      user: process.env.RDS_CL_USER || 'root',
      password: process.env.RDS_CL_PASSWORD || '',
      database: process.env.RDS_CL_DATABASE || 'appointments_cl',
      ssl: process.env.RDS_CL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10000,
    };
  }

  async insertEnrichedAppointment(appointment: EnrichedAppointment): Promise<void> {
    logger.info('Inserting enriched appointment to RDS CL', {
      appointmentId: appointment.id,
    });

    let connection: mysql.Connection | null = null;

    try {
      // Create connection
      connection = await mysql.createConnection(this.connectionConfig);

      // Insert enriched appointment with CL-specific data
      const insertQuery = `
        INSERT INTO appointments (
          id, insured_id, schedule_id, country_iso, status,
          created_at, updated_at, processed_at, processing_lambda,
          doctor_id, doctor_name, specialty_id, specialty_name,
          medical_center_id, center_name, center_address,
          appointment_cost, currency, tax_rate, ttl
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          status = VALUES(status),
          updated_at = VALUES(updated_at),
          processed_at = VALUES(processed_at),
          doctor_id = VALUES(doctor_id),
          doctor_name = VALUES(doctor_name),
          specialty_id = VALUES(specialty_id),
          specialty_name = VALUES(specialty_name),
          medical_center_id = VALUES(medical_center_id),
          center_name = VALUES(center_name),
          center_address = VALUES(center_address),
          appointment_cost = VALUES(appointment_cost),
          currency = VALUES(currency),
          tax_rate = VALUES(tax_rate)
      `;

      const values = [
        appointment.id,
        appointment.insuredId,
        appointment.scheduleId,
        appointment.countryISO,
        appointment.status,
        appointment.createdAt,
        appointment.updatedAt,
        appointment.processedAt ?? null,
        appointment.processingLambda ?? null,
        appointment.doctorId ?? null,
        appointment.doctorName ?? null,
        appointment.specialtyId ?? null,
        appointment.specialtyName ?? null,
        appointment.medicalCenterId ?? null,
        appointment.centerName ?? null,
        appointment.centerAddress ?? null,
        appointment.appointmentCost ?? null,
        appointment.currency ?? null,
        appointment.taxRate ?? null,
        appointment.ttl ?? null,
      ];

      await connection.execute(insertQuery, values);

      logger.info('Enriched appointment inserted successfully to RDS CL', {
        appointmentId: appointment.id,
      });
    } catch (error) {
      logger.error('Failed to insert enriched appointment to RDS CL', error);
      throw new InternalError('Failed to insert appointment to CL database');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async findEnrichedById(id: string): Promise<EnrichedAppointment | null> {
    logger.info('Finding enriched appointment by ID in RDS CL', { appointmentId: id });

    let connection: mysql.Connection | null = null;

    try {
      connection = await mysql.createConnection(this.connectionConfig);

      const selectQuery = `
        SELECT * FROM appointments 
        WHERE id = ? AND country_iso = 'CL'
      `;

      const [rows] = await connection.execute(selectQuery, [id]);
      const appointments = rows as mysql.RowDataPacket[];

      if (appointments.length === 0) {
        logger.info('Enriched appointment not found in RDS CL', { appointmentId: id });
        return null;
      }

      const row = appointments[0];
      if (!row) {
        logger.info('Enriched appointment not found in RDS CL', { appointmentId: id });
        return null;
      }

      return {
        id: row.id,
        insuredId: row.insured_id,
        scheduleId: row.schedule_id,
        countryISO: row.country_iso,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        processedAt: row.processed_at,
        processingLambda: row.processing_lambda,
        doctorId: row.doctor_id,
        doctorName: row.doctor_name,
        specialtyId: row.specialty_id,
        specialtyName: row.specialty_name,
        medicalCenterId: row.medical_center_id,
        centerName: row.center_name,
        centerAddress: row.center_address,
        appointmentCost: row.appointment_cost,
        currency: row.currency,
        taxRate: row.tax_rate,
        ttl: row.ttl,
      };
    } catch (error) {
      logger.error('Failed to find enriched appointment in RDS CL', error);
      throw new InternalError('Failed to find appointment in CL database');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  async findEnrichedByInsuredId(insuredId: string): Promise<EnrichedAppointment[]> {
    logger.info('Finding enriched appointments by insured ID in RDS CL', { insuredId });

    let connection: mysql.Connection | null = null;

    try {
      connection = await mysql.createConnection(this.connectionConfig);

      const selectQuery = `
        SELECT * FROM appointments 
        WHERE insured_id = ? AND country_iso = 'CL'
        ORDER BY created_at DESC
      `;

      const [rows] = await connection.execute(selectQuery, [insuredId]);
      const appointmentRows = rows as mysql.RowDataPacket[];

      return appointmentRows.map(row => ({
        id: row.id,
        insuredId: row.insured_id,
        scheduleId: row.schedule_id,
        countryISO: row.country_iso,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        processedAt: row.processed_at,
        processingLambda: row.processing_lambda,
        doctorId: row.doctor_id,
        doctorName: row.doctor_name,
        specialtyId: row.specialty_id,
        specialtyName: row.specialty_name,
        medicalCenterId: row.medical_center_id,
        centerName: row.center_name,
        centerAddress: row.center_address,
        appointmentCost: row.appointment_cost,
        currency: row.currency,
        taxRate: row.tax_rate,
        ttl: row.ttl,
      }));
    } catch (error) {
      logger.error('Failed to find enriched appointments by insured ID in RDS CL', error);
      throw new InternalError('Failed to find appointments in CL database');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}
