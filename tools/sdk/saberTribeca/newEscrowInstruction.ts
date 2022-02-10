import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import saberTribecaConfiguration from './configuration'
import LockerProgram from './lockerProgram'

export async function newEscrowInstruction({
  lockerProgram,
  authority,
  payer,
}: {
  lockerProgram: LockerProgram
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const [escrow, bump] = await saberTribecaConfiguration.findEscrowAddress(
    authority
  )

  return lockerProgram.program.instruction.newEscrow(bump, {
    accounts: {
      escrow,
      payer,
      locker: saberTribecaConfiguration.locker,
      escrowOwner: authority,
      systemProgram: SystemProgram.programId,
    },
  })
}
