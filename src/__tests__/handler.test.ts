import { APIGatewayProxyEvent } from 'aws-lambda';
import { main } from '../handler';
import { convert } from '../formatConverter';

jest.mock('../formatConverter', () => ({
  convert: jest.fn()
}));

const mockConvert = convert as jest.MockedFunction<typeof convert>;

const createMockEvent = (
  httpMethod: string,
  body: string | null,
  queryStringParameters: Record<string, string> | null = null
): APIGatewayProxyEvent => {
  return {
    httpMethod,
    body,
    queryStringParameters,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    path: '/convert',
    pathParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  };
};

describe('main function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OPTIONS requests', () => {
    it('should return success response for OPTIONS method', () => {
      const event = createMockEvent('OPTIONS', null);
      const result = main(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('');
    });
  });

  describe('Request validation', () => {
    it('should return error when body is missing', () => {
      const event = createMockEvent('POST', null, { from: 'json', to: 'xml' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Request body is required.');
    });

    it('should return error when from parameter is missing', () => {
      const event = createMockEvent('POST', '{"name": "test"}', { to: 'xml' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Both `from` and `to` query parameters are required.');
    });

    it('should return error when to parameter is missing', () => {
      const event = createMockEvent('POST', '{"name": "test"}', { from: 'json' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Both `from` and `to` query parameters are required.');
    });

    it('should return combined error messages when both body and query parameters are missing', () => {
      const event = createMockEvent('POST', null, null);
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Request body is required.\nBoth `from` and `to` query parameters are required.');
    });

    it('should return combined error messages when body is missing and only from parameter is provided', () => {
      const event = createMockEvent('POST', null, { from: 'json' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Request body is required.\nBoth `from` and `to` query parameters are required.');
    });

    it('should return combined error messages when body is missing and only to parameter is provided', () => {
      const event = createMockEvent('POST', null, { to: 'xml' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Request body is required.\nBoth `from` and `to` query parameters are required.');
    });

    it('should return error when from format is unsupported', () => {
      const event = createMockEvent('POST', '{"name": "test"}', { from: 'csv', to: 'json' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Unsupported format. Supported formats are: xml, json, yaml.');
    });

    it('should return error when to format is unsupported', () => {
      const event = createMockEvent('POST', '{"name": "test"}', { from: 'json', to: 'csv' });
      const result = main(event);

      expect(result.statusCode).toBe(400);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe('Unsupported format. Supported formats are: xml, json, yaml.');
    });
  });

  describe('Successful conversions', () => {
    it('should convert to XML with correct content type', () => {
      const jsonData = '{"name": "John", "age": 30}';
      const mockResult = '<root><name>John</name><age>30</age></root>';
      mockConvert.mockReturnValue(mockResult);

      const event = createMockEvent('POST', jsonData, { from: 'json', to: 'xml' });
      const result = main(event);

      expect(mockConvert).toHaveBeenCalledTimes(1);
      expect(mockConvert).toHaveBeenCalledWith(jsonData, 'json', 'xml');
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/xml');
      expect(result.body).toBe(mockResult);
    });

    it('should convert to YAML with correct content type', () => {
      const jsonData = '{"name": "John", "age": 30}';
      const mockResult = 'name: John\nage: 30';
      mockConvert.mockReturnValue(mockResult);

      const event = createMockEvent('POST', jsonData, { from: 'json', to: 'yaml' });
      const result = main(event);

      expect(mockConvert).toHaveBeenCalledTimes(1);
      expect(mockConvert).toHaveBeenCalledWith(jsonData, 'json', 'yaml');
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/yaml');
      expect(result.body).toBe(mockResult);
    });

    it('should convert to JSON with correct content type', () => {
      const yamlData = 'name: John\nage: 30';
      const mockResult = '{"name":"John","age":30}';
      mockConvert.mockReturnValue(mockResult);

      const event = createMockEvent('POST', yamlData, { from: 'yaml', to: 'json' });
      const result = main(event);

      expect(mockConvert).toHaveBeenCalledTimes(1);
      expect(mockConvert).toHaveBeenCalledWith(yamlData, 'yaml', 'json');
      expect(result.statusCode).toBe(200);
      expect(result.headers?.['Content-Type']).toBe('application/json');
      expect(result.body).toBe(mockResult);
    });
  });

  describe('Error handling', () => {
    it('should return 500 error when convert function throws an error', () => {
      const errorMessage = 'Invalid JSON format';
      mockConvert.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      const invalidJson = '{"name": "John"';
      const event = createMockEvent('POST', invalidJson, { from: 'json', to: 'xml' });
      const result = main(event);

      expect(mockConvert).toHaveBeenCalledTimes(1);
      expect(mockConvert).toHaveBeenCalledWith(invalidJson, 'json', 'xml');
      expect(result.statusCode).toBe(500);
      expect(result.headers?.['Content-Type']).toBe('text/plain');
      expect(result.body).toBe(errorMessage);
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers in all responses', () => {
      mockConvert.mockReturnValue('converted data');

      const event = createMockEvent('POST', '{"test": "data"}', { from: 'json', to: 'xml' });
      const result = main(event);

      expect(result.headers?.['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers?.['Access-Control-Allow-Headers']).toBe('Content-Type');
      expect(result.headers?.['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    });
  });
});
