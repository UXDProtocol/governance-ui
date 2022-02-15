import { useCallback, useEffect, useState } from 'react'
import saberTribecaConfiguration from '@tools/sdk/saberTribeca/configuration'

import { LockerData } from '@tools/sdk/saberTribeca/programs'
import useSaberTribecaPrograms from './useSaberTribecaPrograms'

export default function useSaberTribecaLockerData() {
  const { programs } = useSaberTribecaPrograms()

  const [lockerData, setLockerData] = useState<LockerData | null>(null)

  const loadLockerData = useCallback(async (): Promise<LockerData | null> => {
    if (!programs || !saberTribecaConfiguration) {
      return null
    }

    return programs.LockedVoter.account.locker.fetch(
      saberTribecaConfiguration.locker
    )
  }, [programs, saberTribecaConfiguration])

  useEffect(() => {
    loadLockerData().then(setLockerData)
  }, [loadLockerData])

  return {
    lockerData,
    programs,
  }
}
