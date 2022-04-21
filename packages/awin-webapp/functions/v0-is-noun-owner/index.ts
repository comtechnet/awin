import { Handler } from '@netlify/functions';
import { isNounOwner, awinQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(isNounOwner(event.body, awin)),
  };
};

export { handler };
