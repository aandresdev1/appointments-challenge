// DynamoDB implementation of IAppointmentRepository
import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Appointment } from '../../domain/entities/Appointment';
import {
  IAppointmentRepository,
  FindAllResult,
} from '../../domain/repositories/IAppointmentRepository';
import { CountryCode, createLogger, InternalError, GetAllAppointmentsParams } from '@rimac/shared';

const logger = createLogger('DynamoDBAppointmentRepository');

export class DynamoDBAppointmentRepository implements IAppointmentRepository {
  private dynamoClient: DynamoDBClient;
  private tableName: string;

  constructor(tableName: string) {
    this.dynamoClient = new DynamoDBClient({
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    });
    this.tableName = tableName;
  }

  async save(appointment: Appointment): Promise<void> {
    logger.info('Saving appointment to DynamoDB', { appointmentId: appointment.id });

    try {
      const item = {
        PK: `APPT#${appointment.id}`,
        SK: 'METADATA',
        GSI1PK: `INSURED#${appointment.insuredId}`,
        GSI1SK: appointment.createdAt,
        id: appointment.id,
        insuredId: appointment.insuredId,
        scheduleId: appointment.scheduleId,
        countryISO: appointment.countryISO,
        status: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        ttl: appointment.ttl,
      };

      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item, { removeUndefinedValues: true }),
        ConditionExpression: 'attribute_not_exists(PK)', // Prevent overwriting
      });

      await this.dynamoClient.send(command);
      logger.info('Appointment saved successfully', { appointmentId: appointment.id });
    } catch (error) {
      logger.error('Failed to save appointment', error);
      throw new InternalError('Failed to save appointment to database');
    }
  }

  async findById(id: string): Promise<Appointment | null> {
    logger.info('Finding appointment by ID', { appointmentId: id });

    try {
      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `APPT#${id}`,
          SK: 'METADATA',
        }),
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Item) {
        logger.info('Appointment not found', { appointmentId: id });
        return null;
      }

      const item = unmarshall(result.Item);
      const appointment = Appointment.fromRecord(item);

      logger.info('Appointment found', { appointmentId: id });
      return appointment;
    } catch (error) {
      logger.error('Failed to find appointment by ID', error);
      throw new InternalError('Failed to retrieve appointment from database');
    }
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    logger.info('Finding appointments by insured ID', { insuredId });

    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1-InsuredId-CreatedAt-Index',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: marshall({
          ':gsi1pk': `INSURED#${insuredId}`,
        }),
        ScanIndexForward: false, // Sort by createdAt descending (newest first)
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        logger.info('No appointments found for insured ID', { insuredId });
        return [];
      }

      const appointments = result.Items.map(item => {
        const unmarshalled = unmarshall(item);
        return Appointment.fromRecord(unmarshalled);
      });

      logger.info('Appointments found', { insuredId, count: appointments.length });
      return appointments;
    } catch (error) {
      logger.error('Failed to find appointments by insured ID', error);
      throw new InternalError('Failed to retrieve appointments from database');
    }
  }

  async updateStatus(id: string, status: 'pending' | 'completed' | 'failed'): Promise<void> {
    logger.info('Updating appointment status', { appointmentId: id, status });

    try {
      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `APPT#${id}`,
          SK: 'METADATA',
        }),
        UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: marshall(
          {
            ':status': status,
            ':updatedAt': new Date().toISOString(),
          },
          { removeUndefinedValues: true }
        ),
        ConditionExpression: 'attribute_exists(PK)', // Ensure appointment exists
      });

      await this.dynamoClient.send(command);
      logger.info('Appointment status updated successfully', { appointmentId: id, status });
    } catch (error) {
      logger.error('Failed to update appointment status', error);
      throw new InternalError('Failed to update appointment status in database');
    }
  }

  async findByStatus(status: 'pending' | 'completed' | 'failed'): Promise<Appointment[]> {
    logger.info('Finding appointments by status', { status });

    try {
      // Note: This requires a GSI on status if you want efficient queries
      // For now, using scan which is less efficient but works for small datasets
      const command = new QueryCommand({
        TableName: this.tableName,
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: marshall({
          ':status': status,
        }),
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        logger.info('No appointments found for status', { status });
        return [];
      }

      const appointments = result.Items.map(item => {
        const unmarshalled = unmarshall(item);
        return Appointment.fromRecord(unmarshalled);
      });

      logger.info('Appointments found by status', { status, count: appointments.length });
      return appointments;
    } catch (error) {
      logger.error('Failed to find appointments by status', error);
      throw new InternalError('Failed to retrieve appointments from database');
    }
  }

  async findByCountry(countryISO: CountryCode): Promise<Appointment[]> {
    logger.info('Finding appointments by country', { countryISO });

    try {
      const command = new QueryCommand({
        TableName: this.tableName,
        FilterExpression: 'countryISO = :countryISO',
        ExpressionAttributeValues: marshall({
          ':countryISO': countryISO,
        }),
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        logger.info('No appointments found for country', { countryISO });
        return [];
      }

      const appointments = result.Items.map(item => {
        const unmarshalled = unmarshall(item);
        return Appointment.fromRecord(unmarshalled);
      });

      logger.info('Appointments found by country', { countryISO, count: appointments.length });
      return appointments;
    } catch (error) {
      logger.error('Failed to find appointments by country', error);
      throw new InternalError('Failed to retrieve appointments from database');
    }
  }

  async findAll(params?: GetAllAppointmentsParams): Promise<FindAllResult> {
    logger.info('Finding all appointments with filters', { params });

    const { countryISO, status, limit = 20, offset = 0 } = params || {};

    try {
      let command: ScanCommand;
      let filterExpression: string | undefined;
      let expressionAttributeNames: Record<string, string> = {};
      let expressionAttributeValues: Record<string, any> = {};

      // Build filter expression
      const filters: string[] = [];

      if (countryISO) {
        filters.push('countryISO = :countryISO');
        expressionAttributeValues[':countryISO'] = countryISO;
      }

      if (status) {
        filters.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = status;
      }

      if (filters.length > 0) {
        filterExpression = filters.join(' AND ');
      }

      command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeNames:
          Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues:
          Object.keys(expressionAttributeValues).length > 0
            ? marshall(expressionAttributeValues)
            : undefined,
        Limit: limit + 1, // Request one extra to check if there are more results
      });

      const result = await this.dynamoClient.send(command);

      if (!result.Items || result.Items.length === 0) {
        logger.info('No appointments found', { params });
        return {
          appointments: [],
          total: 0,
          hasMore: false,
        };
      }

      // Convert items to appointments
      let appointments = result.Items.map((item: any) => {
        const unmarshalled = unmarshall(item);
        return Appointment.fromRecord(unmarshalled);
      });

      // Sort by createdAt descending (newest first)
      appointments.sort(
        (a: Appointment, b: Appointment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Check if there are more results
      const hasMore = appointments.length > limit;
      if (hasMore) {
        appointments = appointments.slice(0, limit); // Remove the extra item
      }

      // Apply offset
      if (offset > 0) {
        appointments = appointments.slice(offset);
      }

      const total = appointments.length;

      logger.info('All appointments found', {
        params,
        returned: appointments.length,
        total,
        hasMore,
      });

      return {
        appointments,
        total,
        hasMore,
      };
    } catch (error) {
      logger.error('Failed to find all appointments', error);
      throw new InternalError('Failed to retrieve all appointments from database');
    }
  }

  async exists(id: string): Promise<boolean> {
    logger.info('Checking if appointment exists', { appointmentId: id });

    try {
      const appointment = await this.findById(id);
      const exists = appointment !== null;

      logger.info('Appointment existence check completed', { appointmentId: id, exists });
      return exists;
    } catch (error) {
      logger.error('Failed to check appointment existence', error);
      throw new InternalError('Failed to check appointment existence');
    }
  }
}
