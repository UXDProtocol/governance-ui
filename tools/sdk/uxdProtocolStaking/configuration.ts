import { EndpointTypes } from '@models/types'
import { ConfirmOptions, PublicKey } from '@solana/web3.js'

class UXDProtocolStakingConfiguration {
  public readonly programId: {
    [cluster in EndpointTypes]?: PublicKey
  } = {
    devnet: new PublicKey('HK3c5ScJWeb8rvJTthdDQ955K16Nz8BQwZtJkLKY1cCb'),
  }

  public readonly campaignPDA: {
    [cluster in EndpointTypes]?: PublicKey
  } = {
    devnet: new PublicKey('5U5qQ4kL44ygd3uk7JUktA76f5jLJZ7sGt3CVqc4hLVi'),
  }

  public readonly TXN_OPTS: ConfirmOptions = {
    commitment: 'confirmed',
    preflightCommitment: 'processed',
    skipPreflight: false,
  }
}

export default new UXDProtocolStakingConfiguration()
