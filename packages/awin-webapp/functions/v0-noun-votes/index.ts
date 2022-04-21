import { Handler } from '@netlify/functions';
import { NormalizedVote, awinQuery } from '../theGraph';
import * as R from 'ramda';
import { sharedResponseHeaders } from '../utils';

interface NounVote {
  id: number;
  owner: string;
  delegatedTo: null | string;
  votes: NormalizedVote[];
}

const buildNounVote = R.pick(['id', 'owner', 'delegatedTo', 'votes']);

const buildNounVotes = R.map(buildNounVote);

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  const nounVotes: NounVote[] = buildNounVotes(awin);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(nounVotes),
  };
};

export { handler };
