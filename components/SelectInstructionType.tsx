import Select from '@components/inputs/Select'
import useGovernanceAssets, {
  InstructionType,
} from '@hooks/useGovernanceAssets'
import { PackageEnum } from '@utils/uiTypes/proposalCreationTypes'
import { useCallback, useEffect, useState } from 'react'
import PackageSelection from '../pages/dao/[symbol]/proposal/components/PackageSelection'

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
  const [packageId, setPackageId] = useState<PackageEnum | null>(null)
  const { availablePackages, getPackageTypeById } = useGovernanceAssets()

  const [filteredInstructionTypes, setFilteredInstructionTypes] = useState<
    InstructionType[]
  >([])

  const computeFilteredInstructionsTypes = useCallback(() => {
    if (packageId === null) {
      setFilteredInstructionTypes(instructionTypes)

      // Select first instruction by default
      if (instructionTypes.length && !selectedInstruction) {
        onChange({ instructionType: instructionTypes[0], idx })
      }

      return
    }

    if (selectedInstruction && selectedInstruction.packageId !== packageId) {
      onChange({ instructionType: null, idx })
    }

    const filteredInstructionTypes = instructionTypes.filter(
      (instructionType) => instructionType.packageId === packageId
    )

    // Select first instruction by default
    if (filteredInstructionTypes.length && !selectedInstruction) {
      onChange({ instructionType: filteredInstructionTypes[0], idx })
    }

    setFilteredInstructionTypes(filteredInstructionTypes)
  }, [packageId, instructionTypes])

  useEffect(() => {
    computeFilteredInstructionsTypes()
  }, [computeFilteredInstructionsTypes])

  // Only display the package name is a no package is selected
  const getInstructionDisplayName = (instruction?: InstructionType) => {
    if (!instruction) {
      return ''
    }

    if (packageId !== null) {
      return instruction.name
    }

    return `${getPackageTypeById(instruction.packageId)!.name}: ${
      instruction.name
    }`
  }

  return (
    <div>
      <div className="flex pb-2">
        <span>Instruction {idx + 1}</span>

        <span className="text-xs items-center flex items-center text-fgd-3 ml-3">
          Filters by package
        </span>

        <PackageSelection
          className="ml-3"
          selected={packageId}
          packages={availablePackages}
          onClick={(selectedPackageId: PackageEnum) => {
            // Clicking on selected packageName unselect it
            if (selectedPackageId === packageId) {
              setPackageId(null)
              return
            }

            setPackageId(selectedPackageId)
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
        onChange={(instructionType: InstructionType) =>
          onChange({ instructionType, idx })
        }
        value={getInstructionDisplayName(selectedInstruction)}
      >
        {filteredInstructionTypes.map((instructionType) => (
          <Select.Option key={instructionType.name} value={instructionType}>
            <span>{getInstructionDisplayName(instructionType)}</span>
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}

export default SelectInstructionType
