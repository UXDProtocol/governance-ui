import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

export function createSetMintAuthorityInstruction(
  tokenMint: PublicKey,
  newMintAuthority: PublicKey,
  mintAuthority: PublicKey
): TransactionInstruction {
  return Token.createSetAuthorityInstruction(
    TOKEN_PROGRAM_ID,
    tokenMint,
    newMintAuthority,
    'MintTokens',
    mintAuthority,
    []
  )
}
