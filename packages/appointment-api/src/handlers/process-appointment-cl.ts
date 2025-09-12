// Lambda handler for processing CL appointments from SQS
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { DynamoDBAppointmentRepository } from '../infrastructure/repositories/DynamoDBAppointmentRepository';
import { RDSCLAppointmentRepository } from '../infrastructure/repositories/RDSCLAppointmentRepository';
import { Appointment } from '../domain/entities/Appointment';
import {
  createLogger,
  getCurrentTimestamp,
  InternalError,
  EnrichedAppointment,
} from '@rimac/shared';

const logger = createLogger('ProcessAppointmentCLHandler');

// Initialize dependencies
const appointmentRepository = new DynamoDBAppointmentRepository(
  process.env.APPOINTMENTS_TABLE_NAME!
);
const rdsCLRepository = new RDSCLAppointmentRepository();
const eventBridgeClient = new EventBridgeClient({
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
});

export const handler = async (event: SQSEvent): Promise<void> => {
  logger.info('Processing CL appointment batch', {
    recordCount: event.Records.length,
  });

  // Process each SQS record
  for (const record of event.Records) {
    await processRecord(record);
  }

  logger.info('CL appointment batch processing completed');
};

async function processRecord(record: SQSRecord): Promise<void> {
  const messageId = record.messageId;

  try {
    logger.info('Processing CL appointment record', { messageId });

    // Parse the SNS message (SQS receives SNS messages)
    const snsMessage = JSON.parse(record.body);
    const appointmentData = JSON.parse(snsMessage.Message);

    logger.info('Parsed appointment data', {
      appointmentData,
      messageId,
    });

    // Validate this is a CL appointment
    if (appointmentData.countryISO !== 'CL') {
      logger.warn('Non-CL appointment in CL queue', {
        countryISO: appointmentData.countryISO,
        messageId,
      });
      return;
    }

    // Get appointment from DynamoDB
    const appointment = await appointmentRepository.findById(appointmentData.id);

    if (!appointment) {
      logger.error('Appointment not found', {
        appointmentId: appointmentData.id,
        messageId,
      });
      throw new InternalError('Appointment not found');
    }

    // Simulate CL-specific processing
    const enrichedAppointment = await processAppointmentCL(appointment, messageId);

    // 1. Insert enriched appointment to RDS CL
    await rdsCLRepository.insertEnrichedAppointment(enrichedAppointment);

    // 2. Send completion event to EventBridge (instead of updating DynamoDB directly)
    await sendCompletionEvent(appointment.id, 'CL', messageId);

    logger.info('CL appointment processed successfully', {
      appointmentId: appointment.id,
      messageId,
    });
  } catch (error) {
    logger.error('Failed to process CL appointment record', error, messageId);
    // Let SQS handle retry logic and DLQ
    throw error;
  }
}

async function processAppointmentCL(
  appointment: Appointment,
  messageId: string
): Promise<EnrichedAppointment> {
  logger.info('Starting CL-specific processing', {
    appointmentId: appointment.id,
    messageId,
  });

  // Simulate CL-specific business logic
  // In real implementation, this would:
  // 1. Validate with CL medical center
  // 2. Check doctor availability
  // 3. Reserve appointment slot
  // 4. Calculate costs in CLP
  // 5. Update external CL systems

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create enriched appointment with CL-specific data
  const enrichedAppointment: EnrichedAppointment = {
    id: appointment.id,
    insuredId: appointment.insuredId,
    scheduleId: appointment.scheduleId,
    countryISO: appointment.countryISO,
    status: 'completed',
    createdAt: appointment.createdAt,
    updatedAt: appointment.updatedAt || getCurrentTimestamp(),
    processedAt: getCurrentTimestamp(),
    processingLambda: 'processAppointmentCL',

    // CL-specific enriched data
    doctorId: 2001,
    doctorName: 'Dr. Carlos Rodríguez',
    specialtyId: 3001,
    specialtyName: 'Medicina Interna',
    medicalCenterId: 4001,
    centerName: 'Centro Médico Rimac Santiago',
    centerAddress: 'Av. Providencia 1234, Santiago, Chile',
    appointmentCost: 45000.0, // CLP
    currency: 'CLP',
    taxRate: 0.19, // 19% IVA en Chile
    ttl: appointment.ttl || Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 año
  };

  logger.info('CL-specific processing completed', {
    appointmentId: appointment.id,
    messageId,
    processingResult: {
      validated: true,
      reserved: true,
      currency: 'CLP',
      estimatedCost: enrichedAppointment.appointmentCost,
      doctor: enrichedAppointment.doctorName,
      center: enrichedAppointment.centerName,
    },
  });

  return enrichedAppointment;
}

async function sendCompletionEvent(
  appointmentId: string,
  countryISO: string,
  messageId: string
): Promise<void> {
  logger.info('Sending completion event to EventBridge', {
    appointmentId,
    countryISO,
    messageId,
  });

  try {
    const eventDetail = {
      appointmentId,
      countryISO,
      status: 'completed',
      timestamp: getCurrentTimestamp(),
      processingLambda: 'processAppointmentCL',
    };

    const putEventsCommand = new PutEventsCommand({
      Entries: [
        {
          Source: 'rimac.appointments',
          DetailType: 'Appointment Completion',
          Detail: JSON.stringify(eventDetail),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    });

    const result = await eventBridgeClient.send(putEventsCommand);

    if (result.FailedEntryCount && result.FailedEntryCount > 0) {
      logger.error('Failed to send completion event', {
        appointmentId,
        failedEntries: result.Entries?.filter(entry => entry.ErrorCode),
        messageId,
      });
      throw new InternalError('Failed to send completion event to EventBridge');
    }

    logger.info('Completion event sent successfully', {
      appointmentId,
      countryISO,
      messageId,
      eventId: result.Entries?.[0]?.EventId,
    });
  } catch (error) {
    logger.error('Error sending completion event', {
      appointmentId,
      countryISO,
      messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
