// HTTP response helpers for API Gateway

import { APIGatewayProxyResult } from 'aws-lambda';
import { ApiResponse } from '../types';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

export const createResponse = (
  statusCode: number,
  body: ApiResponse,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: { ...DEFAULT_HEADERS, ...headers },
    body: JSON.stringify(body),
  };
};

export const successResponse = <T>(
  data: T,
  message?: string | undefined,
  statusCode: number = 200
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: true,
    data,
    ...(message && { message }),
  });
};

export const errorResponse = (
  error: string,
  statusCode: number = 500,
  message?: string | undefined
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    error,
    ...(message && { message }),
  });
};

export const validationErrorResponse = (
  errors: Array<{ field: string; message: string }>
): APIGatewayProxyResult => {
  return createResponse(400, {
    success: false,
    error: 'Validation failed',
    data: { errors },
  });
};

export const notFoundResponse = (resource: string = 'Resource'): APIGatewayProxyResult => {
  return createResponse(404, {
    success: false,
    error: `${resource} not found`,
  });
};

export const corsResponse = (): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    headers: DEFAULT_HEADERS,
    body: '',
  };
};
