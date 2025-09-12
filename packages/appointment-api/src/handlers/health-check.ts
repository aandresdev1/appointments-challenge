// Lambda handler for health check - GET /health
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, createLogger } from '@rimac/shared';

const logger = createLogger('HealthCheckHandler');

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  logger.info(
    'Processing health check request',
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

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'rimac-appointment-api',
      version: '1.0.0',
      environment: process.env.STAGE || 'unknown',
      region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
    };

    logger.info('Health check completed successfully', healthData, requestId);

    return successResponse(healthData, 'Service is healthy', 200);
  } catch (error) {
    logger.error('Health check failed', error, requestId);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
