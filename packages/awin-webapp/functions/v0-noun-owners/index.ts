import { Handler } from '@netlify/functions';
import { awinQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

export interface LiteNoun {
  id: number;
  owner: string;
  delegatedTo: null | string;
}

const lightenNoun = R.pick(['id', 'owner', 'delegatedTo']);

const lightenawin = R.map(lightenNoun);

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  const liteawin: LiteNoun[] = lightenawin(awin);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(liteawin),
  };
};

export { handler };
