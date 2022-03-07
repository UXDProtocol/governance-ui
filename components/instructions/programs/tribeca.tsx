import { nu64, struct, u8 } from 'buffer-layout'
import { AccountMetaData } from '@solana/spl-governance'
import { Connection } from '@solana/web3.js'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'

export const TRIBECA_PROGRAM_INSTRUCTIONS = {
  [ATribecaConfiguration.gaugeProgramId.toBase58()]: {
    [ATribecaConfiguration.gaugeInstructions.createGaugeVoter]: {
      name: 'Tribeca - Create Gauge Voter',
      accounts: [
        'Gauge Voter',
        'Gaugemeister',
        'Escrow',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const gaugeVoterMint = accounts[0].pubkey.toString()

        return (
          <div className="flex flex-col">
            <div className="flex">
              <span>Gauge Voter:</span>
              <span>{gaugeVoterMint}</span>
            </div>
          </div>
        )
      },
    },

    [ATribecaConfiguration.gaugeInstructions.createGaugeVote]: {
      name: 'Tribeca - Create Gauge Vote',
      accounts: [
        'Gauge Vote',
        'Gauge Voter',
        'Gauge',
        'Payer',
        'System Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const gaugeVoterMint = accounts[1].pubkey.toString()
        const gaugeVoteMint = accounts[0].pubkey.toString()
        const gaugeMint = accounts[2].pubkey.toString()

        return (
          <div className="flex flex-col">
            <div>
              <span>Gauge Voter:</span>
              <span>{gaugeVoterMint}</span>
            </div>

            <div>
              <span>Gauge Vote:</span>
              <span>{gaugeVoteMint}</span>
            </div>

            <div>
              <span>Gauge:</span>
              <span>{gaugeMint}</span>
            </div>
          </div>
        )
      },
    },
  },

  [ATribecaConfiguration.lockedVoterProgramId.toBase58()]: {
    [ATribecaConfiguration.lockedVoterInstructions.newEscrow]: {
      name: 'Tribeca - New Escrow',
      accounts: ['Locker', 'Escrow', 'Escrow Owner', 'Payer', 'System Program'],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const escrowMint = accounts[1].pubkey.toString()

        return (
          <div className="flex flex-col">
            <div>
              <span>Escrow:</span>
              <span>{escrowMint}</span>
            </div>
          </div>
        )
      },
    },

    [ATribecaConfiguration.lockedVoterInstructions.lock]: {
      name: 'Tribeca - Lock',
      accounts: [
        'Locker',
        'Escrow',
        'Escrow Tokens',
        'Escrow Owner',
        'Source Tokens',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('instruction'),

          // ignore 7 bytes
          ...Array.from(new Array(7)).map(u8),

          nu64('amount'),
          nu64('duration'),
        ])

        const { amount, duration } = dataLayout.decode(Buffer.from(data)) as any

        return (
          <div className="flex flex-col">
            <div>
              <span>Native Amount:</span>
              <span>{amount}</span>
            </div>

            <div>
              <span>Duration (seconds):</span>
              <span>{duration}</span>
            </div>
          </div>
        )
      },
    },
  },
}
