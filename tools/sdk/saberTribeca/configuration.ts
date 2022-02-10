import { utils } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'

class SaberTribecaConfiguration {
  public get lockedVoterProgramId(): PublicKey {
    return new PublicKey('LocktDzaV1W2Bm9DeZeiyz4J9zs4fRqNiYqQyracRXw')
  }

  public get saberToken() {
    return {
      name: 'SBR - Saber Protocol Token',
      mint: new PublicKey('Saber2gLauYim4Mvftnrasomsv6NvAuncvMEZwcLpD1'),
      decimals: 6,
    }
  }

  public get locker(): PublicKey {
    return new PublicKey('8erad8kmNrLJDJPe9UkmTHomrMV3EW48sjGeECyVjbYX')
  }

  public async findEscrowAddress(
    authority: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('Escrow'),
        this.locker.toBuffer(),
        authority.toBuffer(),
      ],

      this.lockedVoterProgramId
    )
  }
}

export default new SaberTribecaConfiguration()
