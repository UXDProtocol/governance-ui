import { Connection } from '@solana/web3.js'

const INSTRUCTIONS = {
  // TODO: Update anchor discriminators
  202: {
    name: 'Initialize Realm',
    accounts: [],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      return (
        <>
          <div>{JSON.stringify(data)}</div>
        </>
      )
    },
  },
  186: {
    name: 'Deposit Illiquid Insurance Fund into Realm USDC',
    accounts: [],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      return (
        <>
          <div>{JSON.stringify(data)}</div>
        </>
      )
    },
  },
  145: {
    name: 'Start Phase One',
    accounts: [],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      return (
        <>
          <div>{JSON.stringify(data)}</div>
        </>
      )
    },
  },
  12: {
    name: 'Start Phase Two',
    accounts: [],
    getDataUI: async (connection: Connection, data: Uint8Array) => {
      return (
        <>
          <div>{JSON.stringify(data)}</div>
        </>
      )
    },
  },
}

export const UXD_REDEMPTION_INSTRUCTIONS = {
  // TODO: Adapt to program ID
  SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f: INSTRUCTIONS,
}
