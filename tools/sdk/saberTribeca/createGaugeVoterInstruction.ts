import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function createGaugeVoterInstruction({
  programs,
  authority,
  payer,
}: {
  programs: SaberTribecaPrograms
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [
    gaugeVoter,
    bump,
  ] = await saberTribecaConfiguration.findGaugeVoterAddress(escrow)

  return programs.Gauge.instruction.createGaugeVoter(bump, {
    accounts: {
      gaugeVoter,
      gaugemeister: saberTribecaConfiguration.gaugemeister,
      escrow,
      payer,
      systemProgram: SystemProgram.programId,
    },
  })
}
