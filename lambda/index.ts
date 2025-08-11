import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { router } from './router';

const API_KEY = process.env.API_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  // Lambda Function URL: event.requestContext.http.method is always present
  const method = event.requestContext?.http?.method || '';

  if (method !== 'OPTIONS') {
    const apiKey = event.headers?.['x-api-key'];
    if (apiKey !== API_KEY) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }
  
  try {
    // Route to main logic
    const result = await router(event);
    // Ensure CORS headers are always present
    return {
      ...result,
      headers: {
        ...(result.headers || {}),
        ...CORS_HEADERS,
      },
    };
  } catch (err: any) {
    // Always return CORS headers on error
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: err?.message || 'Internal server error' }),
    };
  }
};
