import { PublicKey } from '@solana/web3.js'
import solendConfiguration, {
  SupportedCollateralMintNames as SolendSupportedCollateralMintNames,
} from '@tools/sdk/solend/configuration'

import saberPoolsConfiguration, {
  SupportedSaberPoolNames,
} from '@tools/sdk/saberPools/configuration'

import {
  saberTribecaConfiguration,
  sunnyTribecaConfiguration,
} from '@tools/sdk/tribeca/configurations'

export type SplTokenInformation = {
  name: string
  mint: PublicKey
  decimals: number
}

export type SupportedSplTokenNames =
  | 'USDC'
  | 'WSOL'
  | 'SBR'
  | 'SUNNY'
  | 'UXP'
  | 'UXD'
  | SolendSupportedCollateralMintNames
  | SupportedSaberPoolNames

export const SPL_TOKENS: {
  [key in SupportedSplTokenNames]: SplTokenInformation
} = {
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

  UXP: {
    name: 'UXP',
    mint: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
    decimals: 9,
  },

  UXD: {
    name: 'UXD',
    mint: new PublicKey('7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT'),
    decimals: 6,
  },

  SBR: saberTribecaConfiguration.token,

  SUNNY: sunnyTribecaConfiguration.token,

  ...solendConfiguration.getSupportedCollateralMintsInformation(),
  ...saberPoolsConfiguration.getPoolsTokens(),
} as const

export type SplTokenUIName = typeof SPL_TOKENS[keyof typeof SPL_TOKENS]['name']

export function getSplTokenMintAddressByUIName(
  nameToMatch: SplTokenUIName
): PublicKey {
  const item = Object.entries(SPL_TOKENS).find(
    ([_, { name }]) => name === nameToMatch
  )

  // theoretically impossible case
  if (!item) {
    throw new Error('Unable to find SPL token mint address by UI name')
  }

  const [, { mint }] = item

  return mint
}
