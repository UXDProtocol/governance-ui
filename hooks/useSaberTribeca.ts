import { Wallet } from '@project-serum/common'
import {
  SolanaAugmentedProvider,
  SolanaProvider,
} from '@saberhq/solana-contrib'
import LockerProgram, {
  LockerData,
} from '@tools/sdk/saberTribeca/lockerProgram'
import { useCallback, useEffect, useState } from 'react'
import saberTribecaConfiguration from '@tools/sdk/saberTribeca/configuration'

import useWalletStore from 'stores/useWalletStore'

export default function useSaberTribeca() {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [lockerProgram, setLockerProgram] = useState<LockerProgram | null>(null)
  const [lockerData, setLockerData] = useState<LockerData | null>(null)

  useEffect(() => {
    if (!connection || !wallet) {
      return
    }

    const solanaProvider = SolanaProvider.load({
      connection: connection.current,
      sendConnection: connection.current,
      wallet: wallet as Wallet,
    })

    setLockerProgram(
      new LockerProgram(new SolanaAugmentedProvider(solanaProvider))
    )
  }, [connection, wallet])

  const loadLockerData = useCallback(async (): Promise<LockerData | null> => {
    if (!lockerProgram || !saberTribecaConfiguration) {
      return null
    }

    return lockerProgram.program.account.locker.fetch(
      saberTribecaConfiguration.locker
    )
  }, [lockerProgram, saberTribecaConfiguration])

  useEffect(() => {
    ;(async () => {
      setLockerData(await loadLockerData())
    })()
  }, [loadLockerData])

  return {
    lockerProgram,
    lockerData,
  }
}
