import { Wallet } from '@project-serum/common'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { useEffect, useState } from 'react'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from '@tools/sdk/saberTribeca/configuration'

import useWalletStore from 'stores/useWalletStore'

export default function useSaberTribecaPrograms() {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [programs, setPrograms] = useState<SaberTribecaPrograms | null>(null)

  useEffect(() => {
    if (!connection || !wallet) {
      return
    }

    const solanaProvider = SolanaProvider.load({
      connection: connection.current,
      sendConnection: connection.current,
      wallet: wallet as Wallet,
    })

    setPrograms(
      saberTribecaConfiguration.loadPrograms(
        new SolanaAugmentedProvider(solanaProvider)
      )
    )
  }, [connection, wallet])

  return {
    programs,
  }
}
