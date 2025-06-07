import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * Returns a success response with status 200
 * @param body - Response body content
 * @param format - Optional format to determine content type
 * @returns API Gateway proxy result with 200 status
 */
export const respondSuccess = (body: string, format?: string): APIGatewayProxyResult => {
  return respond(200, body, getContentType(format));
};

/**
 * Returns a client error response with status 400
 * @param body - Response body content
 * @returns API Gateway proxy result with 400 status
 */
export const respondClientError = (body: string): APIGatewayProxyResult => {
  return respond(400, body);
};

/**
 * Returns a server error response with status 500
 * @param body - Response body content
 * @returns API Gateway proxy result with 500 status
 */
export const respondServerError = (body: string): APIGatewayProxyResult => {
  return respond(500, body);
};

/**
 * Determines the appropriate content type based on format
 * @param format - Optional format string
 * @returns MIME type string for the given format
 */
const getContentType = (format?: string): string => {
  if (format === 'xml') {
    return 'application/xml';
  } else if (format === 'yaml') {
    return 'application/yaml';
  } else if (format === 'json') {
    return 'application/json';
  }
  return 'text/plain';
};

/**
 * Creates an API Gateway response with CORS headers
 * @param statusCode - HTTP status code
 * @param body - Response body content
 * @param contentType - MIME type for the response (defaults to 'text/plain')
 * @returns API Gateway proxy result
 */
const respond = (statusCode: number, body: string, contentType: string = 'text/plain'): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body,
  };
};
