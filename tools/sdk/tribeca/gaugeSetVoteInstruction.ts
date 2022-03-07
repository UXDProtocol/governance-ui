import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import ATribecaConfiguration, { TribecaPrograms } from './ATribecaConfiguration'

export async function gaugeSetVoteInstruction({
  weight,
  programs,
  gauge,
  authority,
  payer,
  tribecaConfiguration,
}: {
  weight: number
  programs: TribecaPrograms
  gauge: PublicKey
  authority: PublicKey
  payer: PublicKey
  tribecaConfiguration: ATribecaConfiguration
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow)

  const [gaugeVote] = await tribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge
  )

  return programs.Gauge.instruction.gaugeSetVote(weight, {
    accounts: {
      escrow,
      gaugemeister: ATribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      voteDelegate: payer,
    },
  })
}
