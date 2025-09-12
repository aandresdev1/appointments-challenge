-- Script para crear tabla appointments en RDS MySQL
-- Conectarse primero a la base de datos appointments

USE appointments;

-- Crear tabla appointments
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
    tax_rate DECIMAL(5,4) DEFAULT 0.1800, -- 18% IGV en Perú
    
    -- TTL para retención de datos
    ttl BIGINT NULL,
    
    -- Índices para mejor rendimiento
    INDEX idx_insured_id (insured_id),
    INDEX idx_schedule_id (schedule_id),
    INDEX idx_country_iso (country_iso),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_composite_insured_country (insured_id, country_iso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar que la tabla se creó correctamente
DESCRIBE appointments;

-- Insertar datos de prueba
INSERT INTO appointments (
    id,
    insured_id,
    schedule_id,
    country_iso,
    status,
    created_at,
    processed_at,
    processing_lambda,
    doctor_id,
    doctor_name,
    specialty_id,
    specialty_name,
    medical_center_id,
    center_name,
    center_address,
    appointment_cost,
    currency,
    tax_rate,
    ttl
) VALUES (
    'test-appointment-pe-001',
    'test-12345',
    999,
    'PE',
    'completed',
    NOW(),
    NOW(),
    'processAppointmentPE',
    'DOC-PE-001',
    'Dr. María García',
    'SPEC-001',
    'Cardiología',
    'CENTER-PE-001',
    'Centro Médico Rimac Lima',
    'Av. Javier Prado Este 4200, Santiago de Surco, Lima',
    150.00,
    'PEN',
    0.1800,
    UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL 1 YEAR))
);

-- Mostrar los datos insertados
SELECT * FROM appointments;