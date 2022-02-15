import { useCallback, useEffect, useState } from 'react'
import saberTribecaConfiguration, {
  GaugeInfos,
} from '@tools/sdk/saberTribeca/configuration'
import useSaberTribecaPrograms from './useSaberTribecaPrograms'

export default function useSaberTribecaGauge() {
  const { programs } = useSaberTribecaPrograms()

  const [gauges, setGauges] = useState<GaugeInfos | null>(null)

  const loadGauges = useCallback(async (): Promise<GaugeInfos | null> => {
    if (!saberTribecaConfiguration || !programs) {
      return null
    }

    return saberTribecaConfiguration.fetchAllGauge(programs)
  }, [saberTribecaConfiguration, programs])

  useEffect(() => {
    loadGauges().then(setGauges)
  }, [loadGauges])

  return {
    gauges,
    programs,
  }
}
