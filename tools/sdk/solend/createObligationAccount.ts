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
  const seed = SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED
  const solendProgramId = SOLEND_PROGRAM_ID
  const lamports = SOLEND_CREATE_OBLIGATION_ACCOUNT_LAMPORTS_MAGIC_NUMBER
  const space = SOLEND_CREATE_OBLIGATION_ACCOUNT_SPACE_MAGIC_NUMBER

  const newAccountPubkey = await deriveObligationAddressFromWalletAndSeed(
    walletAddress
  )

  console.log('createObligationAccount tx building detail', {
    basePubkey: walletAddress.toString(),
    fromPubkey: fundingAddress.toString(),
    newAccountPubkey: newAccountPubkey.toString(),
    programId: solendProgramId.toString(),
    seed,
    lamports,
    space,
  })

  return SystemProgram.createAccountWithSeed({
    basePubkey: walletAddress,
    fromPubkey: fundingAddress,
    programId: solendProgramId,
    newAccountPubkey,
    seed,
    lamports,
    space,
  })
}
