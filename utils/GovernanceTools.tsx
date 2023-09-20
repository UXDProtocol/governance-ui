import {
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units';

export interface GovernanceConfigValues {
  minTokensToCreateProposal: number | string;
  minInstructionHoldUpTime: number;
  maxVotingTime: number;
  voteThresholdPercentage: number;
  mintDecimals: number;
}

// Parses min tokens to create (proposal or governance)
export function parseMinTokensToCreate(
  value: string | number,
  mintDecimals: number,
) {
  return typeof value === 'string'
    ? parseMintNaturalAmountFromDecimal(value, mintDecimals)
    : getMintNaturalAmountFromDecimal(value, mintDecimals);
}
