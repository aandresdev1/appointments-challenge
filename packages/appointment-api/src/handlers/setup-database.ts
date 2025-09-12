// Función temporal para crear tablas PE y CL desde Lambda
import mysql from 'mysql2/promise';
import { createLogger } from '@rimac/shared';

const logger = createLogger('SetupDatabase');

export const handler = async () => {
  // Configurar bases de datos PE y CL
  await setupDatabase('PE');
  await setupDatabase('CL');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Databases PE and CL setup completed successfully',
      timestamp: new Date().toISOString(),
    }),
  };
};

async function setupDatabase(country: 'PE' | 'CL') {
  const connectionConfig = {
    host: country === 'PE' ? process.env.RDS_HOST : process.env.RDS_CL_HOST,
    port: parseInt(process.env.RDS_PORT || process.env.RDS_CL_PORT || '3306'),
    user: country === 'PE' ? process.env.RDS_USER : process.env.RDS_CL_USER,
    password: country === 'PE' ? process.env.RDS_PASSWORD : process.env.RDS_CL_PASSWORD,
    ssl: process.env.RDS_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 10000,
  };

  logger.info(`Setting up ${country} database`, {
    config: { ...connectionConfig, password: '***' },
  });

  let connection: mysql.Connection | null = null;

  try {
    // Conectar a RDS
    connection = await mysql.createConnection(connectionConfig);
    logger.info(`Connected to RDS ${country} successfully`);

    // Crear base de datos específica del país
    const dbName = `appointments_${country.toLowerCase()}`;
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    logger.info(`Database ${dbName} created/verified`);

    // Usar la base de datos
    await connection.query(`USE ${dbName}`);
    logger.info(`Using ${dbName} database`);

    // Crear tabla appointments
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS appointments (
        -- Identificadores principales
        id VARCHAR(255) PRIMARY KEY,
        insured_id VARCHAR(255) NOT NULL,
        schedule_id INT NOT NULL,
        country_iso VARCHAR(2) NOT NULL DEFAULT 'PE',
        
        -- Estado y timestamps
        status VARCHAR(50) NOT NULL DEFAULT 'processing',
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        processed_at TIMESTAMP NULL,
        processing_lambda VARCHAR(255) NULL,
        
        -- Datos enriquecidos de la cita
        doctor_id VARCHAR(255) NULL,
        doctor_name VARCHAR(255) NULL,
        specialty_id VARCHAR(255) NULL,
        specialty_name VARCHAR(255) NULL,
        medical_center_id VARCHAR(255) NULL,
        center_name VARCHAR(255) NULL,
        center_address TEXT NULL,
        
        -- Información financiera
        appointment_cost DECIMAL(10,2) NULL,
        currency VARCHAR(3) DEFAULT 'PEN',
        tax_rate DECIMAL(5,4) DEFAULT 0.1800,
        
        -- TTL para retención de datos
        ttl BIGINT NULL,
        
        -- Índices para mejor rendimiento
        INDEX idx_insured_id (insured_id),
        INDEX idx_schedule_id (schedule_id),
        INDEX idx_country_iso (country_iso),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_composite_insured_country (insured_id, country_iso)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.query(createTableQuery);
    logger.info(`${country} table created successfully`);

    // Insertar datos de prueba específicos del país
    const insertQuery = `
      INSERT IGNORE INTO appointments (
        id, insured_id, schedule_id, country_iso, status,
        created_at, processed_at, processing_lambda,
        doctor_id, doctor_name, specialty_id, specialty_name,
        medical_center_id, center_name, center_address,
        appointment_cost, currency, tax_rate, ttl
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Datos específicos por país
    const countryData =
      country === 'PE'
        ? {
            id: 'test-appointment-pe-001',
            doctorId: 'DOC-PE-001',
            doctorName: 'Dr. María García',
            specialtyId: 'SPEC-PE-001',
            specialtyName: 'Cardiología',
            centerId: 'CENTER-PE-001',
            centerName: 'Centro Médico Rimac Lima',
            centerAddress: 'Av. Javier Prado Este 4200, Santiago de Surco, Lima',
            cost: 150.0,
            currency: 'PEN',
            taxRate: 0.18,
          }
        : {
            id: 'test-appointment-cl-001',
            doctorId: 'DOC-CL-001',
            doctorName: 'Dr. Carlos Rodríguez',
            specialtyId: 'SPEC-CL-001',
            specialtyName: 'Medicina Interna',
            centerId: 'CENTER-CL-001',
            centerName: 'Centro Médico Rimac Santiago',
            centerAddress: 'Av. Providencia 1234, Santiago, Chile',
            cost: 45000.0,
            currency: 'CLP',
            taxRate: 0.19,
          };

    const values = [
      countryData.id,
      'test-12345',
      999,
      country,
      'completed',
      new Date(),
      new Date(),
      'setupDatabase',
      countryData.doctorId,
      countryData.doctorName,
      countryData.specialtyId,
      countryData.specialtyName,
      countryData.centerId,
      countryData.centerName,
      countryData.centerAddress,
      countryData.cost,
      countryData.currency,
      countryData.taxRate,
      Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 año en el futuro
    ];

    await connection.execute(insertQuery, values);
    logger.info(`${country} test data inserted successfully`);
  } catch (error) {
    logger.error(`Error setting up ${country} database:`, error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      logger.info(`${country} connection closed`);
    }
  }
}
