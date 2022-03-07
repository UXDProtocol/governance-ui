import { Wallet } from '@project-serum/common'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { useEffect, useState } from 'react'
import soceanConfiguration, {
  SoceanPrograms,
} from '@tools/sdk/socean/configuration'

import useWalletStore from 'stores/useWalletStore'

export default function useSoceanPrograms() {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [programs, setPrograms] = useState<SoceanPrograms | null>(null)

  useEffect(() => {
    if (!connection || !wallet) {
      return
    }

    const solanaProvider = SolanaProvider.load({
      connection: connection.current,
      sendConnection: connection.current,
      wallet: wallet as Wallet,
    })

    if (connection.cluster === 'localnet') {
      throw new Error('unsupported cluster for Socean programs loading')
    }

    setPrograms(
      soceanConfiguration.loadPrograms(
        new SolanaAugmentedProvider(solanaProvider),
        connection.cluster
      )
    )
  }, [connection, wallet])

  return {
    programs,
  }
}
