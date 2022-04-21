import { Handler } from '@netlify/functions';
import { isNounDelegate, awinQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isNounDelegate(event.body, awin)),
  };
};

export { handler };
