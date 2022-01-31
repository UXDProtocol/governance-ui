import { PublicKey } from '@solana/web3.js'
import {
  SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED,
  SOLEND_PROGRAM_ID,
} from './constant'

export async function deriveObligationAddressFromWalletAndSeed(
  walletAddress: PublicKey
) {
  return PublicKey.createWithSeed(
    walletAddress,
    SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED,
    new PublicKey(SOLEND_PROGRAM_ID)
  )
}
