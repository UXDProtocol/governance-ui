import { PublicKey } from '@solana/web3.js'
import {
  SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED,
  SOLEND_PROGRAM_ID,
} from './constant'

export async function deriveObligationAddressFromWalletAndSeed(
  walletAddress: PublicKey
) {
  const seed = SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED
  const solendProgramId = SOLEND_PROGRAM_ID

  return PublicKey.createWithSeed(
    walletAddress,
    seed,
    new PublicKey(solendProgramId)
  )
}
