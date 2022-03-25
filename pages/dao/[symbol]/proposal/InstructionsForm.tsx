import { LinkButton } from '@components/Button'
import { PlusCircleIcon } from '@heroicons/react/solid'
import { InstructionType } from '@hooks/useGovernanceAssets'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { ComponentInstructionData } from '@utils/uiTypes/proposalCreationTypes'
import { useState } from 'react'
import InstructionForm from './InstructionForm'
import { NewProposalContext } from './new'

const InstructionsForm = ({
  availableInstructions,
  onGovernanceChange,
  onInstructionsDataChange,
}: {
  availableInstructions: InstructionType[]
  onGovernanceChange: (governance: ProgramAccount<Governance> | null) => void
  onInstructionsDataChange: (
    instructionsData: ComponentInstructionData[]
  ) => void
}) => {
  const [
    governance,
    setGovernance,
  ] = useState<ProgramAccount<Governance> | null>(null)

  const handleSetGovernance = (
    governance: ProgramAccount<Governance> | null
  ) => {
    setGovernance(governance)
    onGovernanceChange(governance)
  }

  const [instructionsData, setInstructionsData] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])

  const handleSetInstructionData = (
    val: Partial<ComponentInstructionData>,
    idx: number
  ) => {
    const newInstructionsData = [...instructionsData]
    newInstructionsData[idx] = { ...instructionsData[idx], ...val }
    setInstructionsData(newInstructionsData)
    onInstructionsDataChange(newInstructionsData)
  }

  const setInstructionDataType = ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType
    idx: number
  }) => {
    handleSetInstructionData(
      {
        type: instructionType,
      },
      idx
    )
  }

  const addInstructionData = () => {
    setInstructionsData([...instructionsData, { type: undefined }])
  }

  const removeInstructionData = (idx: number) => {
    setInstructionsData([
      ...instructionsData.filter((x, index) => index !== idx),
    ])
  }

  return (
    <>
      <NewProposalContext.Provider
        value={{
          instructionsData,
          governance,
          handleSetInstructions: handleSetInstructionData,
          setGovernance: handleSetGovernance,
        }}
      >
        <h2>Instructions</h2>

        {instructionsData.map((instruction, idx) => (
          <InstructionForm
            key={idx}
            idx={idx}
            instruction={instruction}
            instructionsData={instructionsData}
            availableInstructions={availableInstructions}
            governance={governance}
            setInstructionDataType={setInstructionDataType}
            removeInstructionData={removeInstructionData}
          />
        ))}
      </NewProposalContext.Provider>

      <div className="flex justify-end mt-4 mb-8 px-6">
        <LinkButton
          className="flex font-bold items-center text-fgd-1 text-sm"
          onClick={addInstructionData}
        >
          <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
          Add instruction
        </LinkButton>
      </div>
    </>
  )
}

export default InstructionsForm
