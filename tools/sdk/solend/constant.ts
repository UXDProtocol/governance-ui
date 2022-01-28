import { PublicKey } from '@solana/web3.js'

export const SOLEND_SPL_TOKENS = {
  SOLEND_CUSDC: {
    name: 'Solend Protocol: cUSDC',
    mint: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
    decimals: 6,
    relatedMint: 'USDC',
  },

  // Add here to handle more TOKEN like cSOL ...
} as const

export const SOLEND_ADDRESSES_PER_TOKEN = {
  USDC: {
    relatedCollateralMint: SOLEND_SPL_TOKENS.SOLEND_CUSDC.mint,
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    reserve: new PublicKey('BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw'),
    reserveLiquiditySupply: new PublicKey(
      '8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf'
    ),
    pythOracle: new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'),
    switchboardFeedAddress: new PublicKey(
      'CZx29wKMUxaJDq6aLVQTdViPL754tTR64NAgQBUGxxHb'
    ),
    reserveCollateralSupplySplTokenAccount: new PublicKey(
      'UtRy8gcEu9fCkDuUrU8EmC7Uc6FZy5NCwttzG7i6nkw'
    ),
  },

  // Add here to handle more TOKEN to transfer
}

export const SOLEND_PROGRAM_ID = new PublicKey(
  'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'
)

export const SOLEND_CREATE_OBLIGATION_ACCOUNT_LAMPORTS_MAGIC_NUMBER = 9938880
export const SOLEND_CREATE_OBLIGATION_ACCOUNT_SPACE_MAGIC_NUMBER = 1300

export const SOLEND_LENDING_MARKET = new PublicKey(
  '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtfpks7FatyKvdY'
)
export const SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED = SOLEND_LENDING_MARKET.toString().slice(
  0,
  32
)

export const SOLEND_LENDING_MARKET_AUTHORITY = new PublicKey(
  'DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby'
)

export type SolendSplToken = keyof typeof SOLEND_SPL_TOKENS
export type SolendSplTokenUIName = typeof SOLEND_SPL_TOKENS[keyof typeof SOLEND_SPL_TOKENS]['name']

export type SolendDeposableAndWithdrawableSupportedMint = keyof typeof SOLEND_ADDRESSES_PER_TOKEN

export function getSolendDeposableAndWithdrawableSupportedMint() {
  return Object.keys(SOLEND_ADDRESSES_PER_TOKEN)
}

export function getTokenNameByReservePublicKey(
  reserve: PublicKey
): string | undefined {
  return Object.keys(SOLEND_ADDRESSES_PER_TOKEN).reduce((tmp, mintName) => {
    if (
      SOLEND_ADDRESSES_PER_TOKEN[mintName].reserve.toString() ==
      reserve.toString()
    ) {
      return mintName
    }

    return tmp
  }, void 0)
}
