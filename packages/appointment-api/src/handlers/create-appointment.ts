// Lambda handler for creating appointments - POST /appointments
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateAppointmentUseCase } from '../application/use-cases/CreateAppointmentUseCase';
import { DynamoDBAppointmentRepository } from '../infrastructure/repositories/DynamoDBAppointmentRepository';
import { SNSMessagingService } from '../infrastructure/messaging/SNSMessagingService';
import {
  AppointmentRequest,
  successResponse,
  errorResponse,
  validationErrorResponse,
  ValidationError,
  ConflictError,
  createLogger,
} from '@rimac/shared';

const logger = createLogger('CreateAppointmentHandler');

// Initialize dependencies
const appointmentRepository = new DynamoDBAppointmentRepository(
  process.env.APPOINTMENTS_TABLE_NAME!
);
const messagingService = new SNSMessagingService(process.env.SNS_TOPIC_ARN!);
const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
  messagingService
);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  logger.info(
    'Processing create appointment request',
    {
      httpMethod: event.httpMethod,
      path: event.path,
    },
    requestId
  );

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers':
            'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'POST,OPTIONS',
        },
        body: '',
      };
    }

    // Validate request body
    if (!event.body) {
      logger.warn('Missing request body', {}, requestId);
      return errorResponse('Request body is required', 400);
    }

    // Parse request body
    let requestBody: AppointmentRequest;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      logger.warn('Invalid JSON in request body', { error: parseError }, requestId);
      return errorResponse('Invalid JSON format', 400);
    }

    // Execute use case
    const result = await createAppointmentUseCase.execute(requestBody, requestId);

    // Return success response
    return successResponse(result, 'Appointment created successfully', 201);
  } catch (error) {
    logger.error('Error processing create appointment request', error, requestId);

    // Handle validation errors
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }

    // Handle conflict errors
    if (error instanceof ConflictError) {
      return errorResponse(error.message, 409);
    }

    // Handle generic errors
    return errorResponse('Internal server error', 500);
  }
};
