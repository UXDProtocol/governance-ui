import { PublicKey } from '@solana/web3.js'
import ATribecaConfiguration from './ATribecaConfiguration'

class SaberTribecaConfiguration extends ATribecaConfiguration {
  public readonly locker = new PublicKey(
    '8erad8kmNrLJDJPe9UkmTHomrMV3EW48sjGeECyVjbYX'
  )

  public readonly token = {
    name: 'SBR - Saber Protocol Token',
    mint: new PublicKey('Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1'),
    decimals: 6,
  }

  public readonly name = 'Saber'
}

class SunnyTribecaConfiguration extends ATribecaConfiguration {
  public readonly locker = new PublicKey(
    '4tr9CDSgZRLYPGdcsm9PztaGSfJtX5CEmqDbEbvCTX2G'
  )

  public readonly token = {
    name: 'SUNNY - Sunny Governance Token',
    mint: new PublicKey('SUNNYWgPQmFxe9wTZzNK7iPnJ3vYDrkgnxJRJm1s3ag'),
    decimals: 6,
  }

  public readonly name = 'Sunny'
}

export const saberTribecaConfiguration = new SaberTribecaConfiguration()
export const sunnyTribecaConfiguration = new SunnyTribecaConfiguration()

export const configurations = {
  saber: saberTribecaConfiguration,
  sunny: sunnyTribecaConfiguration,
}

export function getConfigurationByName(
  name: string
): ATribecaConfiguration | null {
  return (
    Object.values(configurations).find(
      (configuration) => configuration.name === name
    ) ?? null
  )
}
