import { Wallet } from '@project-serum/common'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import { useCallback, useEffect, useState } from 'react'
import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from '@tools/sdk/saberTribeca/configuration'

import useWalletStore from 'stores/useWalletStore'
import { LockerData } from '@tools/sdk/saberTribeca/programs'

export default function useSaberTribeca() {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [programs, setPrograms] = useState<SaberTribecaPrograms | null>(null)
  const [lockerData, setLockerData] = useState<LockerData | null>(null)

  console.log('LockerData', lockerData)

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

  const loadLockerData = useCallback(async (): Promise<LockerData | null> => {
    if (!programs || !saberTribecaConfiguration) {
      return null
    }

    return programs.LockedVoter.account.locker.fetch(
      saberTribecaConfiguration.locker
    )
  }, [programs, saberTribecaConfiguration])

  useEffect(() => {
    ;(async () => {
      setLockerData(await loadLockerData())
    })()
  }, [loadLockerData])

  return {
    programs,
    lockerData,
  }
}
