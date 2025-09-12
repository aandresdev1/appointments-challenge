// Lambda handler for getting all appointments - GET /appointments
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetAllAppointmentsUseCase } from '../application/use-cases/GetAllAppointmentsUseCase';
import { DynamoDBAppointmentRepository } from '../infrastructure/repositories/DynamoDBAppointmentRepository';
import {
  successResponse,
  errorResponse,
  ValidationError,
  createLogger,
  GetAllAppointmentsParams,
  CountryCode,
  AppointmentStatus,
} from '@rimac/shared';

const logger = createLogger('GetAllAppointmentsHandler');

// Initialize dependencies
const appointmentRepository = new DynamoDBAppointmentRepository(
  process.env.APPOINTMENTS_TABLE_NAME!
);
const getAllAppointmentsUseCase = new GetAllAppointmentsUseCase(appointmentRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  logger.info(
    'Processing get all appointments request',
    {
      httpMethod: event.httpMethod,
      path: event.path,
      queryStringParameters: event.queryStringParameters,
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
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: '',
      };
    }

    // Parse query parameters
    const params = parseQueryParameters(event.queryStringParameters);

    logger.info('Parsed query parameters', { params }, requestId);

    // Execute use case
    const result = await getAllAppointmentsUseCase.execute(params, requestId);

    // Return success response
    return successResponse(result, 'All appointments retrieved successfully', 200);
  } catch (error) {
    logger.error('Error processing get all appointments request', error, requestId);

    // Handle validation errors
    if (error instanceof ValidationError) {
      return errorResponse(error.message, 400);
    }

    // Handle generic errors
    return errorResponse('Internal server error', 500);
  }
};

/**
 * Parse and validate query parameters
 */
function parseQueryParameters(
  queryParams: { [key: string]: string | undefined } | null
): GetAllAppointmentsParams | undefined {
  if (!queryParams) {
    return undefined;
  }

  const params: GetAllAppointmentsParams = {};

  // Parse countryISO
  if (queryParams.countryISO) {
    params.countryISO = queryParams.countryISO as CountryCode;
  }

  // Parse status
  if (queryParams.status) {
    params.status = queryParams.status as AppointmentStatus;
  }

  // Parse limit
  if (queryParams.limit) {
    const limit = parseInt(queryParams.limit, 10);
    if (!isNaN(limit)) {
      params.limit = limit;
    }
  }

  // Parse offset
  if (queryParams.offset) {
    const offset = parseInt(queryParams.offset, 10);
    if (!isNaN(offset)) {
      params.offset = offset;
    }
  }

  return Object.keys(params).length > 0 ? params : undefined;
}
