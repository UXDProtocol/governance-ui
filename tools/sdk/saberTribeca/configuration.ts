import { utils } from '@project-serum/anchor'
import { newProgramMap } from '@saberhq/anchor-contrib'
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib'
import { PublicKey } from '@solana/web3.js'
import { GovernTypes, UgovernJSON } from './programs/govern'
import { LockedVoterProgram, UlockedUvoterJSON } from './programs/lockedVoter'

export type SaberTribecaPrograms = {
  LockedVoter: LockedVoterProgram
  Govern: GovernTypes
}

class SaberTribecaConfiguration {
  public get lockedVoterProgramId(): PublicKey {
    return new PublicKey('LocktDzaV1W2Bm9DeZeiyz4J9zs4fRqNiYqQyracRXw')
  }

  public get governProgramId(): PublicKey {
    return new PublicKey('Govz1VyoyLD5BL6CSCxUJLVLsQHRwjfFj1prNsdNg5Jw')
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

  public loadPrograms(provider: SolanaAugmentedProvider): SaberTribecaPrograms {
    return newProgramMap<SaberTribecaPrograms>(
      provider,

      {
        // IDLs
        LockedVoter: UlockedUvoterJSON,
        Govern: UgovernJSON,
      },

      {
        // Addresses
        LockedVoter: this.lockedVoterProgramId,
        Govern: this.governProgramId,
      }
    )
  }
}

export default new SaberTribecaConfiguration()
