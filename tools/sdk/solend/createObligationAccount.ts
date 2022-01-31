import { PublicKey, SystemProgram } from '@solana/web3.js'
import {
  SOLEND_CREATE_OBLIGATION_ACCOUNT_LAMPORTS_MAGIC_NUMBER,
  SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED,
  SOLEND_CREATE_OBLIGATION_ACCOUNT_SPACE_MAGIC_NUMBER,
  SOLEND_PROGRAM_ID,
} from './constant'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function createObligationAccount({
  fundingAddress,
  walletAddress,
}: {
  fundingAddress: PublicKey
  walletAddress: PublicKey
}) {
  const newAccountPubkey = await deriveObligationAddressFromWalletAndSeed(
    walletAddress
  )

  return SystemProgram.createAccountWithSeed({
    basePubkey: walletAddress,
    fromPubkey: fundingAddress,
    newAccountPubkey,
    programId: SOLEND_PROGRAM_ID,
    seed: SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED,
    lamports: SOLEND_CREATE_OBLIGATION_ACCOUNT_LAMPORTS_MAGIC_NUMBER,
    space: SOLEND_CREATE_OBLIGATION_ACCOUNT_SPACE_MAGIC_NUMBER,
  })
}
