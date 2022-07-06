import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function gaugeRevertVoteInstruction({
  programs,
  gauge,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  gauge: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const { currentRewardsEpoch } = await tribecaConfiguration.fetchGaugemeister(
    programs.Gauge,
  );

  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow);

  const [gaugeVote] = await tribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge,
  );

  const votingEpoch = currentRewardsEpoch + 1;

  const [epochGauge] = await tribecaConfiguration.findEpochGaugeAddress(
    gauge,
    votingEpoch,
  );

  const [epochGaugeVoter] =
    await tribecaConfiguration.findEpochGaugeVoterAddress(
      gaugeVoter,
      votingEpoch,
    );

  const [epochGaugeVote] = await tribecaConfiguration.findEpochGaugeVoteAddress(
    gaugeVote,
    votingEpoch,
  );

  console.log('Gauge Revert Vote', {
    gaugemeister: tribecaConfiguration.gaugemeister.toString(),
    gauge: gauge.toString(),
    gaugeVoter: gaugeVoter.toString(),
    gaugeVote: gaugeVote.toString(),
    epochGauge: epochGauge.toString(),
    epochGaugeVoter: epochGaugeVoter.toString(),
    escrow: escrow.toString(),
    voteDelegate: authority.toString(),
    epochGaugeVote: epochGaugeVote.toString(),
    payer: payer.toString(),
  });

  return programs.Gauge.instruction.gaugeRevertVote({
    accounts: {
      gaugemeister: tribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      epochGauge,
      epochGaugeVoter,
      escrow,
      voteDelegate: authority,
      epochGaugeVote,
      payer,
    },
  });
}
