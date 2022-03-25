import Select from '@components/inputs/Select'
import { InstructionType } from '@hooks/useGovernanceAssets'

const SelectInstructionType = ({
  idx,
  instructionTypes,
  selectedInstruction,
  onChange,
}: {
  idx: number
  selectedInstruction?: InstructionType
  instructionTypes: InstructionType[]

  onChange: ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType
    idx: number
  }) => void
}) => {
  return (
    <Select
      className="h-12"
      disabled={!instructionTypes.length}
      placeholder={`${
        instructionTypes.length
          ? 'Select instruction'
          : 'No available instructions'
      }`}
      label={`Instruction ${idx + 1}`}
      onChange={(instructionType: InstructionType) =>
        onChange({ instructionType, idx })
      }
      value={selectedInstruction?.name}
    >
      {instructionTypes.map((instructionType) => (
        <Select.Option key={instructionType.name} value={instructionType}>
          <span>{instructionType.name}</span>
        </Select.Option>
      ))}
    </Select>
  )
}

export default SelectInstructionType
