import { SingleSideStakingClient } from '@uxdprotocol/uxd-staking-client'
import { useEffect, useState } from 'react'
import configuration from '@tools/sdk/uxdProtocolStaking'
import { useConnection } from '@solana/wallet-adapter-react'
import useWalletOnePointOh from './useWalletOnePointOh'

const CLUSTER = 'mainnet'

export default function useSingleSideStakingClient(): {
  client: SingleSideStakingClient | null
} {
  const { connection } = useConnection()
  const wallet = useWalletOnePointOh()

  const [client, setClient] = useState<SingleSideStakingClient | null>(null)

  useEffect(() => {
    if (!connection || !wallet) {
      return
    }

    // if (connection.cluster === 'localnet') {
    //   throw new Error('unsupported cluster for Socean programs loading')
    // }

    const programId = configuration.programId[CLUSTER]

    if (!programId) {
      throw new Error('UXD Staking program id not found')
    }

    setClient(
      SingleSideStakingClient.load({
        connection: connection,
        programId,
      })
    )
  }, [connection, wallet])

  return {
    client,
  }
}
