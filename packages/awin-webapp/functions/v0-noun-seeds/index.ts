import { Handler } from '@netlify/functions';
import { awinQuery, Seed } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface SeededNoun {
  id: number;
  seed: Seed;
}

const buildSeededNoun = R.pick(['id', 'seed']);

const buildSeededawin = R.map(buildSeededNoun);

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  const seededawin: SeededNoun[] = buildSeededawin(awin);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(seededawin),
  };
};

export { handler };
