import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { refreshObligationInstruction } from '@solendprotocol/solend-sdk'
import {
  SolendDeposableAndWithdrawableSupportedMint as SolendDeposableAndWithdrawableSupportedMint,
  SOLEND_ADDRESSES_PER_TOKEN,
  SOLEND_PROGRAM_ID,
} from './constant'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

// Would be nice if we could automatically detect which reserves needs to be refreshed
// based on the obligationOwner assets in solend
export async function refreshObligation({
  obligationOwner,
  mintNames,
}: {
  obligationOwner: PublicKey
  mintNames: SolendDeposableAndWithdrawableSupportedMint[]
}): Promise<TransactionInstruction> {
  const obligationAddress = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  const depositReserves = mintNames.map(
    (x) => SOLEND_ADDRESSES_PER_TOKEN[x].reserve
  )

  return refreshObligationInstruction(
    obligationAddress,
    // Both deposit reserves + borrow reserves parameters leads to the same data in instruction
    // they are concatenate
    depositReserves,
    [],
    SOLEND_PROGRAM_ID
  )
}
