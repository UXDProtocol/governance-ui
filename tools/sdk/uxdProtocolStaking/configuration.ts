import { EndpointTypes } from '@models/types'
import { ConfirmOptions, PublicKey } from '@solana/web3.js'

class UXDProtocolStakingConfiguration {
  public readonly programId: {
    [cluster in EndpointTypes]?: PublicKey
  } = {
    devnet: new PublicKey('G32Z4MiJhFfaidSLCz36WBLzcNJQ4o4mv6dHLzM35Huq'),
  }

  public readonly instructionCodes = {
    initializeStakingCampaign: 161,
    addStakingOption: 191,
    activateStakingOption: 193,
    finalizeStakingCampaign: 166,
  }

  public readonly TXN_OPTS: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
    skipPreflight: false,
  }
}

export default new UXDProtocolStakingConfiguration()
