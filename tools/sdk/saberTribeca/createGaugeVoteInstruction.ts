import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function createGaugeVoteInstruction({
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
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await saberTribecaConfiguration.findGaugeVoterAddress(
    escrow
  )

  const [
    gaugeVote,
    bump,
  ] = await saberTribecaConfiguration.findGaugeVoteAddress(gaugeVoter, gauge)

  return programs.Gauge.instruction.createGaugeVote(bump, {
    accounts: {
      gaugeVoter,
      gaugeVote,
      gauge,
      payer,
      systemProgram: SystemProgram.programId,
    },
  })
}
