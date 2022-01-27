import { PublicKey } from '@solana/web3.js'

export const SOLEND_TOKEN_ACCOUNT_MINTS = {
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

export const SOLEND_CREATE_OBLIGATION_ACCOUNT_SEED =
  '4UpD2fh7xH3VP9QQaXtsS1YY3bxzWhtf'

export const SOLEND_PROGRAM_ID = new PublicKey(
  'So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo'
)

export const SOLEND_CREATE_OBLIGATION_ACCOUNT_LAMPORTS_MAGIC_NUMBER = 9938880
export const SOLEND_CREATE_OBLIGATION_ACCOUNT_SPACE_MAGIC_NUMBER = 1300
