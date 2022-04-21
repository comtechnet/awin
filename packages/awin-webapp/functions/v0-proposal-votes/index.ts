import { Handler } from '@netlify/functions';
import { NormalizedNoun, NormalizedVote, awinQuery } from '../theGraph';
import { sharedResponseHeaders } from '../utils';

interface ProposalVote {
  nounId: number;
  owner: string;
  delegatedTo: null | string;
  supportDetailed: number;
}

interface ProposalVotes {
  [key: number]: ProposalVote[];
}

const builtProposalVote = (noun: NormalizedNoun, vote: NormalizedVote): ProposalVote => ({
  nounId: noun.id,
  owner: noun.owner,
  delegatedTo: noun.delegatedTo,
  supportDetailed: vote.supportDetailed,
});

const reduceProposalVotes = (awin: NormalizedNoun[]) =>
  awin.reduce((acc: ProposalVotes, noun: NormalizedNoun) => {
    for (let i in noun.votes) {
      const vote = noun.votes[i];
      if (!acc[vote.proposalId]) acc[vote.proposalId] = [];
      acc[vote.proposalId].push(builtProposalVote(noun, vote));
    }
    return acc;
  }, {});

const handler: Handler = async (event, context) => {
  const awin = await awinQuery();
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      ...sharedResponseHeaders,
    },
    body: JSON.stringify(reduceProposalVotes(awin)),
  };
};

export { handler };
