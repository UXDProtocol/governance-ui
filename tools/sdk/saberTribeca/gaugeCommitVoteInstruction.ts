import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function gaugeCommitVoteInstruction({
  programs,
  gauge,
  authority,
  payer,
}: {
  programs: SaberTribecaPrograms
  gauge: PublicKey
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const {
    currentRewardsEpoch,
  } = await saberTribecaConfiguration.fetchGaugemeister(programs.Gauge)

  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await saberTribecaConfiguration.findGaugeVoterAddress(
    escrow
  )

  const [gaugeVote] = await saberTribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge
  )

  const votingEpoch = currentRewardsEpoch + 1

  const [epochGauge] = await saberTribecaConfiguration.findEpochGaugeAddress(
    gauge,
    votingEpoch
  )

  const [
    epochGaugeVoter,
  ] = await saberTribecaConfiguration.findEpochGaugeVoterAddress(
    gaugeVoter,
    votingEpoch
  )

  const [
    epochGaugeVote,
    voteBump,
  ] = await saberTribecaConfiguration.findEpochGaugeVoteAddress(
    gaugeVote,
    votingEpoch
  )

  return programs.Gauge.instruction.gaugeCommitVote(voteBump, {
    accounts: {
      gaugemeister: saberTribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      payer,
      systemProgram: SystemProgram.programId,
      epochGauge,
      epochGaugeVoter,
      epochGaugeVote,
    },
  })
}
