// Lambda handler for getting appointments - GET /appointments/{insuredId}
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetAppointmentsByInsuredUseCase } from '../application/use-cases/GetAppointmentsByInsuredUseCase';
import { DynamoDBAppointmentRepository } from '../infrastructure/repositories/DynamoDBAppointmentRepository';
import { successResponse, errorResponse, NotFoundError, createLogger } from '@rimac/shared';

const logger = createLogger('GetAppointmentsHandler');

// Initialize dependencies
const appointmentRepository = new DynamoDBAppointmentRepository(
  process.env.APPOINTMENTS_TABLE_NAME!
);
const getAppointmentsUseCase = new GetAppointmentsByInsuredUseCase(appointmentRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  logger.info(
    'Processing get appointments request',
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
          'Access-Control-Allow-Methods': 'GET,OPTIONS',
        },
        body: '',
      };
    }

    // Extract insured ID from path parameters
    const insuredId = event.pathParameters?.insuredId;

    if (!insuredId) {
      logger.warn('Missing insuredId path parameter', {}, requestId);
      return errorResponse('insuredId is required', 400);
    }

    // Execute use case
    const result = await getAppointmentsUseCase.execute(insuredId, requestId);

    // Return success response
    return successResponse(result, 'Appointments retrieved successfully', 200);
  } catch (error) {
    logger.error('Error processing get appointments request', error, requestId);

    // Handle not found errors
    if (error instanceof NotFoundError) {
      return errorResponse(error.message, 404);
    }

    // Handle generic errors
    return errorResponse('Internal server error', 500);
  }
};
