import { utils } from '@project-serum/anchor'
import { newProgramMap } from '@saberhq/anchor-contrib'
import { SolanaAugmentedProvider } from '@saberhq/solana-contrib'
import { PublicKey } from '@solana/web3.js'
import {
  GaugemeisterData,
  GaugeProgram,
  MineProgram,
  QuarryMineJSON,
  UgaugeJSON,
} from './programs'
import { GovernProgram, UgovernJSON } from './programs/govern'
import { LockedVoterProgram, UlockedUvoterJSON } from './programs/lockedVoter'

export type SaberTribecaPrograms = {
  LockedVoter: LockedVoterProgram
  Govern: GovernProgram
  Gauge: GaugeProgram
  Mine: MineProgram
}

export type GaugeInfo = {
  mint: PublicKey
  logoURI?: string
}

export type GaugeInfos = {
  [name: string]: GaugeInfo
}

class SaberTribecaConfiguration {
  public get mintInfoEndpoint(): string {
    return 'https://cdn.jsdelivr.net/gh/CLBExchange/certified-token-list/101'
  }

  public get lockedVoterProgramId(): PublicKey {
    return new PublicKey('LocktDzaV1W2Bm9DeZeiyz4J9zs4fRqNiYqQyracRXw')
  }

  public get governProgramId(): PublicKey {
    return new PublicKey('Govz1VyoyLD5BL6CSCxUJLVLsQHRwjfFj1prNsdNg5Jw')
  }

  public get gaugeProgramId(): PublicKey {
    return new PublicKey('GaugesLJrnVjNNWLReiw3Q7xQhycSBRgeHGTMDUaX231')
  }

  public get gaugemeister(): PublicKey {
    return new PublicKey('28ZDtf6d2wsYhBvabTxUHTRT6MDxqjmqR7RMCp348tyU')
  }

  public get quarryMineProgramId(): PublicKey {
    return new PublicKey('QMNeHCGYnLVDn1icRAfQZpjPLBNkfGbSKRB83G5d8KB')
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

  public async findGaugeVoterAddress(
    escrow: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('GaugeVoter'),
        this.gaugemeister.toBuffer(),
        escrow.toBuffer(),
      ],
      this.gaugeProgramId
    )
  }

  public async findGaugeVoteAddress(
    gaugeVoter: PublicKey,
    gauge: PublicKey
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('GaugeVote'),
        gaugeVoter.toBuffer(),
        gauge.toBuffer(),
      ],
      this.gaugeProgramId
    )
  }

  protected encodeU32(num: number): Buffer {
    const buf = Buffer.alloc(4)
    buf.writeUInt32LE(num)
    return buf
  }

  public async findEpochGaugeVoterAddress(
    gaugeVoter: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGaugeVoter'),
        gaugeVoter.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      this.gaugeProgramId
    )
  }

  public async findEpochGaugeAddress(
    gauge: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGauge'),
        gauge.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      this.gaugeProgramId
    )
  }

  public async findEpochGaugeVoteAddress(
    gaugeVote: PublicKey,
    votingEpoch: number
  ): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode('EpochGaugeVote'),
        gaugeVote.toBuffer(),
        this.encodeU32(votingEpoch),
      ],
      this.gaugeProgramId
    )
  }

  public async fetchAllGauge(
    programs: SaberTribecaPrograms
  ): Promise<GaugeInfos> {
    const gauges = (await programs.Gauge.account.gauge.all()).filter(
      ({ account: { gaugemeister, isDisabled } }) =>
        gaugemeister.toString() !== this.gaugemeister.toString() || isDisabled
    )

    const quarryInfos = await programs.Mine.account.quarry.fetchMultiple(
      gauges.map((x) => x.account.quarry)
    )

    if (!quarryInfos) {
      throw new Error('Cannot load quarry infos')
    }

    const mints = quarryInfos.map((x) => (x as any).tokenMintKey)

    const infosInArray = await Promise.all(
      mints.map((x) =>
        (async () => {
          try {
            const response = await fetch(
              `${this.mintInfoEndpoint}/${x.toString()}.json`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                },
              }
            )

            const { name, logoURI } = await response.json()

            return {
              mint: x,
              logoURI,
              name,
            }
          } catch {
            return {
              name: x,
              mint: x,
            }
          }
        })()
      )
    )

    return infosInArray.reduce((gaugeInfos, { name, ...other }) => {
      return {
        ...gaugeInfos,

        [name]: {
          ...other,
        },
      }
    }, {})
  }

  public async fetchGaugemeister(
    gaugeProgram: GaugeProgram
  ): Promise<GaugemeisterData> {
    const data = await gaugeProgram.account.gaugemeister.fetchNullable(
      this.gaugemeister
    )

    if (!data) {
      throw new Error(`Empty Gaugemeister data ${this.gaugemeister}`)
    }

    return data
  }

  public loadPrograms(provider: SolanaAugmentedProvider): SaberTribecaPrograms {
    return newProgramMap<SaberTribecaPrograms>(
      provider,

      {
        // IDLs
        LockedVoter: UlockedUvoterJSON,
        Govern: UgovernJSON,
        Gauge: UgaugeJSON,
        Mine: QuarryMineJSON,
      },

      {
        // Addresses
        LockedVoter: this.lockedVoterProgramId,
        Govern: this.governProgramId,
        Gauge: this.gaugeProgramId,
        Mine: this.quarryMineProgramId,
      }
    )
  }
}

export default new SaberTribecaConfiguration()
