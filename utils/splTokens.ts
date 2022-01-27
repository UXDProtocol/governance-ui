import { PublicKey } from '@solana/web3.js'
import { SOLEND_SPL_TOKENS } from '@tools/sdk/solend/constant'

export const BASE_MINTS = {
  USDC: {
    name: 'USD Coin',
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    decimals: 6,
  },
  WSOL: {
    name: 'Wrapped SOL',
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    decimals: 9,
  },
} as const

export const SPL_TOKENS = {
  ...SOLEND_SPL_TOKENS,
  ...BASE_MINTS,
} as const

export type SplToken = keyof typeof SPL_TOKENS
export type SplTokenUIName = typeof SPL_TOKENS[keyof typeof SPL_TOKENS]['name']

export function getSplTokenMintAddressByUIName(nameToMatch: string): PublicKey {
  const item = Object.entries(SPL_TOKENS).find(
    ([_, { name }]) => name === nameToMatch
  )

  if (!item) {
    throw new Error('must be here')
  }

  const [, { mint }] = item

  return mint
}
