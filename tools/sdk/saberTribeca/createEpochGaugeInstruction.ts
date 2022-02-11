import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function createEpochGaugeInstruction({
  programs,
  gauge,
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

  const votingEpoch = currentRewardsEpoch + 1

  const [
    epochGauge,
    bump,
  ] = await saberTribecaConfiguration.findEpochGaugeAddress(gauge, votingEpoch)

  return programs.Gauge.instruction.createEpochGauge(bump, votingEpoch, {
    accounts: {
      epochGauge,
      gauge,
      payer,
      systemProgram: SystemProgram.programId,
    },
  })
}
