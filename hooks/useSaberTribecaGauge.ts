import { useCallback, useEffect, useState } from 'react'
import saberTribecaConfiguration, {
  GaugeInfos,
} from '@tools/sdk/saberTribeca/configuration'
import useSaberTribeca from './useSaberTribeca'

export default function useSaberTribecaGauge() {
  const { programs } = useSaberTribeca()

  const [gauges, setGauges] = useState<GaugeInfos | null>(null)

  const loadGauges = useCallback(async (): Promise<GaugeInfos | null> => {
    if (!saberTribecaConfiguration || !programs) {
      return null
    }

    return saberTribecaConfiguration.fetchAllGauge(programs)
  }, [saberTribecaConfiguration, programs])

  useEffect(() => {
    ;(async () => {
      setGauges(await loadGauges())
    })()
  }, [loadGauges])

  return {
    gauges,
  }
}
