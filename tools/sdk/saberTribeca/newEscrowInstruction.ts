import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'

export async function newEscrowInstruction({
  programs,
  authority,
  payer,
}: {
  programs: SaberTribecaPrograms
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const [escrow, bump] = await saberTribecaConfiguration.findEscrowAddress(
    authority
  )

  return programs.LockedVoter.instruction.newEscrow(bump, {
    accounts: {
      escrow,
      payer,
      locker: saberTribecaConfiguration.locker,
      escrowOwner: authority,
      systemProgram: SystemProgram.programId,
    },
  })
}
