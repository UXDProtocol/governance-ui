import {
  getTokenNameByReservePublicKey,
  SOLEND_PROGRAM_ID,
} from '@tools/sdk/solend/constant'
import { LendingInstruction } from '@solendprotocol/solend-sdk/dist/instructions/instruction'
import { Connection } from '@solana/web3.js'
import { AccountMetaData } from '@solana/spl-governance'

export const SOLEND_PROGRAM_INSTRUCTIONS = {
  [SOLEND_PROGRAM_ID.toBase58()]: {
    [LendingInstruction.InitObligation]: {
      name: 'Solend - Init Obligation',
      accounts: [
        'Obligation',
        'Lending Market Account',
        'Obligation Owner',
        'Sysvar: Clock',
        'Rent Program',
        'Token Program',
      ],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        const mint = accounts[2].pubkey.toString()

        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Init obligation for:</span>
              <span>{mint}</span>
            </div>
          </div>
        )
      },
    },

    [LendingInstruction.RefreshObligation]: {
      name: '',
      accounts: [],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        // All accounts starting at index 2 are reserve accounts
        const reserveAccounts = accounts.slice(2)

        const reserveNames = reserveAccounts.map(
          (x) => getTokenNameByReservePublicKey(x.pubkey) ?? 'unknown'
        )

        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {reserveNames.map((x, xi) => (
              <div
                key={x}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <span>Reserve #{xi + 1}</span>
                <span>{x}</span>
              </div>
            ))}
          </div>
        )
      },
    },

    [LendingInstruction.RefreshReserve]: {
      name: '',
      accounts: [],
      getDataUI: (
        _connection: Connection,
        _data: Uint8Array,
        accounts: AccountMetaData[]
      ) => {
        console.log(
          'accounts',
          accounts,
          accounts.map((x) => x.pubkey.toString())
        )

        const reserve = accounts[0]

        const tokenName =
          getTokenNameByReservePublicKey(reserve.pubkey) ?? 'unknown'

        return (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Reserve</span>
            <span>{tokenName}</span>
          </div>
        )
      },
    },

    /*
    [LendingInstruction.DepositReserveLiquidityAndObligationCollateral]: {
      name: '',
      accounts: [],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return (
          <>
            <p>Hello</p>
          </>
        )
      },
    },

    [LendingInstruction.WithdrawObligationCollateralAndRedeemReserveLiquidity]: {
      name: '',
      accounts: [],
      getDataUI: (
        _connection: Connection,
        data: Uint8Array,
        _accounts: AccountMetaData[]
      ) => {
        return (
          <>
            <p>Hello</p>
          </>
        )
      },
    },
    */
  },
}
