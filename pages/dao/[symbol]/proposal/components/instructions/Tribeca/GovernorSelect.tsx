import Select from '@components/inputs/Select'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import {
  configurations as tribecaConfigurations,
  getConfigurationByName,
} from '@tools/sdk/tribeca/configurations'

const GovernorSelect = ({
  tribecaConfiguration,
  setTribecaConfiguration,
}: {
  tribecaConfiguration: ATribecaConfiguration | null
  setTribecaConfiguration: (v: ATribecaConfiguration | null) => void
}) => {
  return (
    <Select
      label="Governor"
      value={tribecaConfiguration?.name ?? null}
      placeholder="Please select..."
      onChange={(value) => {
        setTribecaConfiguration(getConfigurationByName(value))
      }}
    >
      {Object.values(tribecaConfigurations || {}).map((configuration) => (
        <Select.Option key={configuration.name} value={configuration.name}>
          {configuration.name}
        </Select.Option>
      ))}
    </Select>
  )
}

export default GovernorSelect
