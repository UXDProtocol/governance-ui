import { SOLEND_TOKEN_ACCOUNT_MINTS } from '@tools/sdk/solend/constant'

export const TOKEN_ACCOUNT_MINTS = {
  ...SOLEND_TOKEN_ACCOUNT_MINTS,
} as const

export type TokenAccountMints = keyof typeof TOKEN_ACCOUNT_MINTS

export type TokenAccountMintNames = typeof TOKEN_ACCOUNT_MINTS[keyof typeof TOKEN_ACCOUNT_MINTS]['name']
