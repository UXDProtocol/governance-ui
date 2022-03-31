import { Connection } from '@solana/web3.js'
import { nu64, struct, u32, u8 } from 'buffer-layout'
import { AccountMetaData } from '@solana/spl-governance'
import stakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import { tryGetMint } from '@utils/tokens'
import { getMintDecimalAmountFromNatural } from '@tools/sdk/units'

export const UXD_PROTOCOL_STAKING_INSTRUCTIONS = {
  [stakingConfiguration.programId.devnet!.toBase58()]: {
    [stakingConfiguration.instructionCodes.initializeStakingCampaign]: {
      name: 'UXD Staking - Initialize Staking Campaign',
      accounts: [
        'authority',
        'payer',
        'stakingCampaign',
        'rewardMint',
        'stakedMint',
        'rewardVault',
        'stakedVault',
        'authorityRewardAta',
        'systemProgram',
        'tokenProgram',
        'associatedTokenProgram',
        'rent',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          nu64('startTs'),
          data.length === 32 ? nu64('endTs') : u8('optionEndTs'),
          nu64('rewardDepositAmount'),
        ])

        const authority = accounts[0].pubkey
        const payer = accounts[1].pubkey
        const campaignPDA = accounts[2].pubkey
        const rewardMint = accounts[3].pubkey
        const stackedMint = accounts[4].pubkey

        const mintInfo = await tryGetMint(connection, rewardMint)

        if (!mintInfo)
          throw new Error(`Cannot load mintInfo ${rewardMint.toBase58()}`)

        const args = dataLayout.decode(Buffer.from(data)) as any

        const { startTs, endTs, rewardDepositAmount } = args

        const startDate = new Date(startTs).toUTCString()
        const endDate = endTs ? new Date(endTs).toUTCString() : '-'

        const rewardDepositAmountUi = getMintDecimalAmountFromNatural(
          mintInfo.account,
          rewardDepositAmount
        )
          .toNumber()
          .toLocaleString()

        return (
          <>
            <p>{`authority: ${authority.toBase58()}`}</p>
            <p>{`payer: ${payer.toBase58()}`}</p>
            <p>{`campaign PDA: ${campaignPDA.toBase58()}`}</p>
            <p>{`start of the campaign: ${startDate}`}</p>
            <p>{`end of the campaign: ${endDate}`}</p>
            <p>{`reward deposit amount: ${rewardDepositAmountUi}`}</p>
            <p>{`reward mint: ${rewardMint.toBase58()}`}</p>
            <p>{`staked mint: ${stackedMint.toBase58()}`}</p>
          </>
        )
      },
    },

    [stakingConfiguration.instructionCodes.addStakingOption]: {
      name: 'UXD Staking - Add Staking Options',
      accounts: ['authority', 'payer', 'stakingCampaign'],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        // 12 Byte is the header that is always there
        // 16 bytes = 8 for lockupSecs, 8 for apr
        const nbOptions = (data.length - 12) / 16

        console.log('nbOptions', nbOptions)

        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          u32('nbOption'),

          ...Array.from(new Array(nbOptions)).reduce((acc, _, index) => {
            return [...acc, nu64(`lockupSecs${index}`), nu64(`apr${index}`)]
          }, []),
        ])

        const authority = accounts[0].pubkey
        const payer = accounts[1].pubkey
        const campaignPDA = accounts[2].pubkey

        const args = dataLayout.decode(Buffer.from(data)) as any

        return (
          <>
            <p>{`authority: ${authority.toBase58()}`}</p>
            <p>{`payer: ${payer.toBase58()}`}</p>
            <p>{`campaign PDA: ${campaignPDA.toBase58()}`}</p>

            {Array.from(new Array(nbOptions)).map((_, index) => {
              return (
                <>
                  <p>{`option ${index + 1} lockup time on seconds: ${Number(
                    args[`lockupSecs${index}`]
                  ).toLocaleString()}`}</p>
                  <p>{`option ${index + 1} apr: ${args[`apr${index}`]}%`}</p>
                </>
              )
            })}
          </>
        )
      },
    },

    [stakingConfiguration.instructionCodes.activateStakingOption]: {
      name: 'UXD Staking - Activate Staking Options',
      accounts: ['authority', 'payer', 'stakingCampaign'],
      getDataUI: async (
        _connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const dataLayout = struct([
          u8('instruction'),
          u8('SIGHASH_1'),
          u8('SIGHASH_2'),
          u8('SIGHASH_3'),
          u8('SIGHASH_4'),
          u8('SIGHASH_5'),
          u8('SIGHASH_6'),
          u8('SIGHASH_7'),
          u8('stakingOptionIdentifier'),
          u8('activate'),
        ])

        const authority = accounts[0].pubkey
        const payer = accounts[1].pubkey
        const campaignPDA = accounts[2].pubkey

        const args = dataLayout.decode(Buffer.from(data)) as any

        const { stakingOptionIdentifier, activate } = args

        return (
          <>
            <p>{`authority: ${authority.toBase58()}`}</p>
            <p>{`payer: ${payer.toBase58()}`}</p>
            <p>{`campaign PDA: ${campaignPDA.toBase58()}`}</p>
            <p>{`staking option identifier: ${stakingOptionIdentifier.toString()}`}</p>
            <p>{`status: ${activate === 0 ? 'DEACTIVATE' : 'ACTIVATE'}`}</p>
          </>
        )
      },
    },

    [stakingConfiguration.instructionCodes.finalizeStakingCampaign]: {
      name: 'UXD Staking - Finalize Staking Campaign',
      accounts: [
        'authority',
        'payer',
        'stakingCampaign',
        'rewardMint',
        'rewardVault',
        'authorityRewardAta',
        'systemProgram',
        'tokenProgram',
        'associatedTokenProgram',
        'rent',
      ],
      getDataUI: async (
        connection: Connection,
        data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const authority = accounts[0].pubkey
        const payer = accounts[1].pubkey
        const campaignPDA = accounts[2].pubkey
        const rewardMint = accounts[3].pubkey
        const rewardVault = accounts[4].pubkey

        return (
          <>
            <p>{`authority: ${authority.toBase58()}`}</p>
            <p>{`payer: ${payer.toBase58()}`}</p>
            <p>{`campaign PDA: ${campaignPDA.toBase58()}`}</p>
            <p>{`reward mint: ${rewardMint.toBase58()}`}</p>
            <p>{`reward vault: ${rewardVault.toBase58()}`}</p>
          </>
        )
      },
    },
  },
}
