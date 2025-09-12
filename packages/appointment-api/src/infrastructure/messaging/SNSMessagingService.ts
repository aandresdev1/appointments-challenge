// SNS implementation of IMessagingService
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { Appointment } from '../../domain/entities/Appointment';
import { IMessagingService } from '../../application/interfaces/IMessagingService';
import { createLogger, InternalError } from '@rimac/shared';

const logger = createLogger('SNSMessagingService');

export class SNSMessagingService implements IMessagingService {
  private snsClient: SNSClient;
  private topicArn: string;

  constructor(topicArn: string) {
    this.snsClient = new SNSClient({ region: process.env.AWS_DEFAULT_REGION || 'us-east-1' });
    this.topicArn = topicArn;
  }

  async publishAppointmentCreated(appointment: Appointment, requestId?: string): Promise<void> {
    logger.info(
      'Publishing appointment created event',
      { appointmentId: appointment.id },
      requestId
    );

    try {
      const message = {
        id: appointment.id,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        timestamp: appointment.createdAt,
        eventType: 'AppointmentCreated',
      };

      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          countryISO: {
            DataType: 'String',
            StringValue: appointment.countryISO,
          },
          eventType: {
            DataType: 'String',
            StringValue: 'AppointmentCreated',
          },
        },
      });

      const result = await this.snsClient.send(command);

      logger.info(
        'Appointment created event published successfully',
        {
          appointmentId: appointment.id,
          messageId: result.MessageId,
        },
        requestId
      );
    } catch (error) {
      logger.error('Failed to publish appointment created event', error, requestId);
      throw new InternalError('Failed to publish appointment event');
    }
  }

  async publishAppointmentUpdated(appointment: Appointment, requestId?: string): Promise<void> {
    logger.info(
      'Publishing appointment updated event',
      { appointmentId: appointment.id },
      requestId
    );

    try {
      const message = {
        id: appointment.id,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        status: appointment.status,
        timestamp: appointment.updatedAt || new Date().toISOString(),
        eventType: 'AppointmentUpdated',
      };

      const command = new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          countryISO: {
            DataType: 'String',
            StringValue: appointment.countryISO,
          },
          eventType: {
            DataType: 'String',
            StringValue: 'AppointmentUpdated',
          },
          status: {
            DataType: 'String',
            StringValue: appointment.status,
          },
        },
      });

      const result = await this.snsClient.send(command);

      logger.info(
        'Appointment updated event published successfully',
        {
          appointmentId: appointment.id,
          messageId: result.MessageId,
        },
        requestId
      );
    } catch (error) {
      logger.error('Failed to publish appointment updated event', error, requestId);
      throw new InternalError('Failed to publish appointment update event');
    }
  }
}
