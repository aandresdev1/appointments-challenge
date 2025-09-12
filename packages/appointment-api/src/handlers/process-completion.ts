import { SQSEvent, SQSRecord } from 'aws-lambda';
import { createLogger } from '@rimac/shared';
import { DynamoDBAppointmentRepository } from '../infrastructure/repositories/DynamoDBAppointmentRepository';

const logger = createLogger('ProcessCompletionHandler');
const appointmentRepository = new DynamoDBAppointmentRepository(
  process.env.APPOINTMENTS_TABLE_NAME!
);

interface EventBridgeDetail {
  appointmentId: string;
  countryISO: string;
  status: string;
  timestamp: string;
}

interface EventBridgeMessage {
  version: string;
  id: string;
  'detail-type': string;
  source: string;
  account: string;
  time: string;
  region: string;
  detail: EventBridgeDetail;
}

export const handler = async (event: SQSEvent): Promise<void> => {
  logger.info('Processing completion events', { recordCount: event.Records.length });

  try {
    // Process each SQS record
    for (const record of event.Records) {
      await processCompletionRecord(record);
    }

    logger.info('Completion batch processing completed');
  } catch (error) {
    logger.error('Error processing completion batch', { error });
    throw error;
  }
};

async function processCompletionRecord(record: SQSRecord): Promise<void> {
  const messageId = record.messageId;

  try {
    logger.info('Processing completion record', { messageId });

    // Parse the EventBridge message from SQS body
    const eventBridgeMessage: EventBridgeMessage = JSON.parse(record.body);
    const { appointmentId, countryISO } = eventBridgeMessage.detail;

    logger.info('Parsed EventBridge completion event', {
      appointmentId,
      countryISO,
      messageId,
      eventSource: eventBridgeMessage.source,
      eventDetailType: eventBridgeMessage['detail-type'],
    });

    // Update appointment status to completed in DynamoDB
    await appointmentRepository.updateStatus(appointmentId, 'completed');

    logger.info('Appointment completion processed successfully', {
      appointmentId,
      countryISO,
      messageId,
    });
  } catch (error) {
    logger.error('Error processing completion record', {
      messageId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
