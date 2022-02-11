import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function prepareEpochGaugeVoterInstruction({
  programs,
  authority,
  payer,
}: {
  programs: SaberTribecaPrograms
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const {
    currentRewardsEpoch,
    locker,
  } = await saberTribecaConfiguration.fetchGaugemeister(programs.Gauge)

  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await saberTribecaConfiguration.findGaugeVoterAddress(
    escrow
  )

  const [
    epochGaugeVoter,
    bump,
  ] = await saberTribecaConfiguration.findEpochGaugeVoterAddress(
    gaugeVoter,
    currentRewardsEpoch + 1
  )

  return programs.Gauge.instruction.prepareEpochGaugeVoter(bump, {
    accounts: {
      gaugemeister: saberTribecaConfiguration.gaugemeister,
      locker,
      escrow,
      gaugeVoter,
      payer,
      systemProgram: SystemProgram.programId,
      epochGaugeVoter,
    },
  })
}
