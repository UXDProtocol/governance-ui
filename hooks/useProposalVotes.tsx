import { Proposal } from '@solana/spl-governance';
import { getProposalMaxVoteWeight } from '../models/voteWeights';
import { calculatePct, fmtTokenAmount } from '../utils/formatting';
import useRealm from './useRealm';

export default function useProposalVotes(proposal?: Proposal) {
  const { realm, mint, councilMint, governances } = useRealm();

  const governance =
    proposal && governances[proposal.governance?.toBase58()]?.account;

  const proposalMint =
    proposal?.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint;

  // TODO: optimize using memo
  if (!realm || !proposal || !governance || !proposalMint)
    return {
      voteThresholdPct: 100,
      yesVotePct: 0,
      yesVoteProgress: 0,
      yesVoteCount: 0,
      noVoteCount: 0,
      minimumYesVotes: 0,
      yesVotesRequired: 0,
      minimumNoVotes: 0,
      noVotesRequired: 0,
    };

  const isCommunityVote =
    proposal?.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58();

  const voteThresholdPct = isCommunityVote
    ? governance.config.communityVoteThreshold.value || 0
    : governance.config.communityVoteThreshold.value || 0;

  const maxVoteWeight = getProposalMaxVoteWeight(
    realm.account,
    proposal,
    proposalMint,
  );

  const minimumYesVotes =
    fmtTokenAmount(maxVoteWeight, proposalMint.decimals) *
    (voteThresholdPct / 100);
  const yesVotePct = calculatePct(proposal.getYesVoteCount(), maxVoteWeight);
  const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100;

  const yesVoteCount = fmtTokenAmount(
    proposal.getYesVoteCount(),
    proposalMint.decimals,
  );
  const noVoteCount = fmtTokenAmount(
    proposal.getNoVoteCount(),
    proposalMint.decimals,
  );

  const totalVoteCount = yesVoteCount + noVoteCount;

  const getRelativeVoteCount = (voteCount: number) =>
    totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100;

  const relativeYesVotes = getRelativeVoteCount(yesVoteCount);
  const relativeNoVotes = getRelativeVoteCount(noVoteCount);

  const rawYesVotesRequired = minimumYesVotes - yesVoteCount;
  const yesVotesRequired =
    proposalMint.decimals == 0
      ? Math.ceil(rawYesVotesRequired)
      : rawYesVotesRequired;

  const minimumNoVotes =
    fmtTokenAmount(maxVoteWeight, proposalMint.decimals) - minimumYesVotes;

  const rawNoVotesRequired = minimumNoVotes - noVoteCount;
  const noVotesRequired =
    proposalMint.decimals == 0
      ? Math.ceil(rawNoVotesRequired)
      : rawNoVotesRequired;

  return {
    voteThresholdPct,
    yesVotePct,
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
    relativeYesVotes,
    relativeNoVotes,
    minimumYesVotes,
    yesVotesRequired,
    rawNoVotesRequired,
    noVotesRequired,
  };
}
