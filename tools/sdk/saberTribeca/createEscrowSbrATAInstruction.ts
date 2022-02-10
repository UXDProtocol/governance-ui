import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import saberTribecaConfiguration from './configuration'
import { LockerData } from './lockerProgram'
import { createAssociatedTokenAccount } from '@utils/associated'

export async function createEscrowATAInstruction({
  lockerData,
  authority,
  payer,
}: {
  lockerData: LockerData
  authority: PublicKey
  payer: PublicKey
}): Promise<TransactionInstruction> {
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const [tx] = await createAssociatedTokenAccount(
    payer,
    escrow,
    lockerData.tokenMint
  )

  return tx
}
