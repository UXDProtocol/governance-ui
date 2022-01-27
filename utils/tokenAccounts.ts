import { PublicKey } from '@solana/web3.js'
import { SOLEND_TOKEN_ACCOUNT_MINTS } from '@tools/sdk/solend/constant'

export const TOKEN_ACCOUNT_MINTS = {
  ...SOLEND_TOKEN_ACCOUNT_MINTS,
} as const

export type TokenAccountMints = keyof typeof TOKEN_ACCOUNT_MINTS

export type TokenAccountMintNames = typeof TOKEN_ACCOUNT_MINTS[keyof typeof TOKEN_ACCOUNT_MINTS]['name']

export function getTokenAccountMintByName(nameToMatch: string): PublicKey {
  const item = Object.entries(TOKEN_ACCOUNT_MINTS).find(
    ([_, { name }]) => name === nameToMatch
  )

  if (!item) {
    throw new Error('must be here')
  }

  const [, { mint }] = item

  return mint
}
