import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { initObligationInstruction } from '@solendprotocol/solend-sdk'
import { SOLEND_LENDING_MARKET, SOLEND_PROGRAM_ID } from './constant'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function initObligationAccount({
  obligationOwner,
}: {
  obligationOwner: PublicKey
}): Promise<TransactionInstruction> {
  const obligationAddress = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  return initObligationInstruction(
    obligationAddress,
    SOLEND_LENDING_MARKET,
    obligationOwner,
    SOLEND_PROGRAM_ID
  )
}
