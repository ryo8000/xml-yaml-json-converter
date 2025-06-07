import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { convert } from './formatConverter';
import { respondSuccess, respondClientError, respondServerError } from './response';
import { SupportedFormat } from './types';

const supportedFormats = ['json', 'xml', 'yaml'];

/**
 * AWS Lambda handler function
 * @param event - API Gateway proxy event
 * @returns Promise resolving to API Gateway proxy result
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  return main(event);
};

/**
 * Main processing function that handles format conversion requests
 * @param event - API Gateway proxy event containing request data
 * @returns API Gateway proxy result with converted data or error
 */
export const main = (event: APIGatewayProxyEvent): APIGatewayProxyResult => {
  if (event.httpMethod === 'OPTIONS') {
    return respondSuccess('');
  }

  const from = event.queryStringParameters?.['from'];
  const to = event.queryStringParameters?.['to'];

  const errors = [];
  if (!event.body) {
    errors.push('Request body is required.');
  }
  if (!from || !to) {
    errors.push('Both `from` and `to` query parameters are required.');
  }

  if (errors.length > 0) {
    return respondClientError(errors.join('\n'));
  }

  if (!supportedFormats.includes(from as string) || !supportedFormats.includes(to as string)) {
    return respondClientError('Unsupported format. Supported formats are: xml, json, yaml.');
  }

  try {
    const result = convert(event.body as string, from as SupportedFormat, to as SupportedFormat);
    return respondSuccess(result, to);
  } catch (error) {
    return respondServerError((error as Error).message);
  }
};
