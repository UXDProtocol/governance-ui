import { PublicKey } from '@solana/web3.js'

export const TOKEN_ACCOUNT_MINTS = {
  SOLEND_CUSDC: {
    name: 'Solend Protocol: cUSDC',
    mint: new PublicKey('993dVFL2uXWYeoXuEBFXR4BijeXdTv4s6BzsCjJZuwqk'),
  },
  SOLEND_CSOL: {
    name: 'Solend Protocol: cSOL',
    mint: new PublicKey('5h6ssFpeDeRbzsEHDbTQNH7nVGgsKrZydxdSTnLm6QdV'),
  },
  SOLEND_CETH: {
    name: 'Solend Protocol: cETH',
    mint: new PublicKey('AppJPZka33cu4DyUenFe9Dc1ZmZ3oQju6mBn9k37bNAa'),
  },
  SOLEND_CBTC: {
    name: 'Solend Protocol: cBTC',
    mint: new PublicKey('Gqu3TFmJXfnfSX84kqbZ5u9JjSBVoesaHjfTsaPjRSnZ'),
  },
} as const

export type TokenAccountMints = keyof typeof TOKEN_ACCOUNT_MINTS

export type TokenAccountMintNames = typeof TOKEN_ACCOUNT_MINTS[keyof typeof TOKEN_ACCOUNT_MINTS]['name']
