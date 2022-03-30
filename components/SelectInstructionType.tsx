import Select from '@components/inputs/Select'
import { InstructionType } from '@hooks/useGovernanceAssets'
import { useCallback, useEffect, useState } from 'react'
import PackageSelection, {
  PackageName,
} from '../pages/dao/[symbol]/proposal/components/PackageSelection'

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
    instructionType: InstructionType | null
    idx: number
  }) => void
}) => {
  const [packageName, setPackageName] = useState<PackageName | null>(null)

  const [filteredInstructionTypes, setFilteredInstructionTypes] = useState<
    InstructionType[]
  >([])

  const computeFilteredInstructionsTypes = useCallback(() => {
    if (packageName === null) {
      setFilteredInstructionTypes(instructionTypes)
      return
    }

    if (
      selectedInstruction &&
      selectedInstruction.name.toLowerCase().indexOf(packageName) === -1
    ) {
      onChange({ instructionType: null, idx })
    }

    setFilteredInstructionTypes(
      instructionTypes.filter(
        (instructionType) =>
          instructionType.name.toLowerCase().indexOf(packageName) !== -1
      )
    )
  }, [packageName, instructionTypes])

  useEffect(() => {
    computeFilteredInstructionsTypes()
  }, [computeFilteredInstructionsTypes])

  return (
    <div>
      <div className="flex pb-2">
        <span>Instruction {idx + 1}</span>

        <span className="text-xs items-center flex items-center text-fgd-3 ml-3">
          Filters by package
        </span>

        <PackageSelection
          className="ml-3"
          selected={packageName}
          onClick={(selected: PackageName) => {
            // Clicking on selected packageName unselect it
            if (selected === packageName) {
              setPackageName(null)
              return
            }

            setPackageName(selected)
          }}
        />
      </div>

      <Select
        className="h-12"
        disabled={!filteredInstructionTypes.length}
        placeholder={`${
          filteredInstructionTypes.length
            ? 'Select instruction'
            : 'No available instructions'
        }`}
        // label={`Instruction ${idx + 1}`}
        onChange={(instructionType: InstructionType) =>
          onChange({ instructionType, idx })
        }
        value={selectedInstruction?.name}
      >
        {filteredInstructionTypes.map((instructionType) => (
          <Select.Option key={instructionType.name} value={instructionType}>
            <span>{instructionType.name}</span>
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default SelectInstructionType
