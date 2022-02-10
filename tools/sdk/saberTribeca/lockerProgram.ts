import { newProgramMap, AnchorTypes } from '@saberhq/anchor-contrib'
import {
  ReadonlyProvider,
  Provider,
} from '@saberhq/anchor-contrib/node_modules/@saberhq/solana-contrib'
import { UlockedUvoterJSON, UlockedUvoterIDL } from './idls/locked_voter'
import saberTribecaConfiguration from './configuration'

export type LockedVoterTypes = AnchorTypes<
  UlockedUvoterIDL,
  {
    locker: LockerData
    escrow: EscrowData
  }
>

type Accounts = LockedVoterTypes['Accounts']
export type LockerData = Accounts['Locker']
export type EscrowData = Accounts['Escrow']

export type LockerParams = LockedVoterTypes['Defined']['LockerParams']

export type LockedVoterError = LockedVoterTypes['Error']
export type LockedVoterProgram = LockedVoterTypes['Program']

class LockerProgram {
  readonly program: LockedVoterProgram

  constructor(provider: Provider | ReadonlyProvider) {
    const { LockedVoter: program } = newProgramMap<{
      LockedVoter: LockedVoterProgram
    }>(
      provider,

      {
        // IDLs
        LockedVoter: UlockedUvoterJSON,
      },

      {
        // Addresses
        LockedVoter: saberTribecaConfiguration.lockedVoterProgramId,
      }
    )

    this.program = program
  }
}

export default LockerProgram
