export const respond = (statusCode: number, body?: any) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',  
    'Content-Type': 'application/json',
  },
  body: body ? JSON.stringify(body) : '',
});
