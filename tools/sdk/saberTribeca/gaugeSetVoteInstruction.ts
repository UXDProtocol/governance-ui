import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function gaugeSetVoteInstruction({
  weight,
  programs,
  gauge,
  authority,
  payer,
}: {
  weight: number
  programs: SaberTribecaPrograms
  gauge: PublicKey
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await saberTribecaConfiguration.findGaugeVoterAddress(
    escrow
  )

  const [gaugeVote] = await saberTribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge
  )

  return programs.Gauge.instruction.gaugeSetVote(weight, {
    accounts: {
      escrow,
      gaugemeister: saberTribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      voteDelegate: payer,
    },
  })
}
