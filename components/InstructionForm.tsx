import { LinkButton } from '@components/Button'
import { XCircleIcon } from '@heroicons/react/solid'
import { InstructionType } from '@hooks/useGovernanceAssets'
import {
  Governance,
  GovernanceAccountType,
  ProgramAccount,
} from '@solana/spl-governance'
import {
  ComponentInstructionData,
  Instructions,
} from '@utils/uiTypes/proposalCreationTypes'
import InstructionContentContainer from '../pages/dao/[symbol]/proposal/components/InstructionContentContainer'
import ProposalForm from '../pages/dao/[symbol]/proposal/components/instructions/ProposalForm'
import SelectInstructionType from './SelectInstructionType'

const InstructionForm = ({
  idx,
  availableInstructions,
  instructionsData,
  instruction,
  governance,
  setInstructionDataType,
  removeInstructionData,
}: {
  idx: number
  instruction: ComponentInstructionData
  instructionsData: ComponentInstructionData[]
  availableInstructions: InstructionType[]
  governance: ProgramAccount<Governance> | null

  setInstructionDataType: ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType | null
    idx: number
  }) => void

  removeInstructionData: (idx: number) => void
}) => {
  const getAvailableInstructionsForIndex = (idx: number) => {
    if (idx === 0) {
      return availableInstructions
    }

    return availableInstructions.filter((x) =>
      customInstructionFilterForSelectedGovernance(x.id)
    )
  }

  const customInstructionFilterForSelectedGovernance = (
    instructionType: Instructions
  ) => {
    if (!governance) {
      return true
    }

    const governanceType = governance.account.accountType
    const instructionsAvailableAfterProgramGovernance = [Instructions.Base64]

    switch (governanceType) {
      case GovernanceAccountType.ProgramGovernanceV1:
      case GovernanceAccountType.ProgramGovernanceV2:
        return instructionsAvailableAfterProgramGovernance.includes(
          instructionType
        )
      default:
        return true
    }
  }

  const availableInstructionsForIdx = getAvailableInstructionsForIndex(idx)

  return (
    <div key={idx} className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg">
      <SelectInstructionType
        idx={idx}
        instructionTypes={availableInstructionsForIdx}
        onChange={({ instructionType, idx }) =>
          setInstructionDataType({ instructionType, idx })
        }
        selectedInstruction={instruction.type}
      />

      <div className="flex items-end pt-4">
        <InstructionContentContainer
          idx={idx}
          instructionsData={instructionsData}
        >
          {instruction.type ? (
            <ProposalForm
              governance={governance}
              index={idx}
              itxType={instruction.type?.id}
            />
          ) : null}
        </InstructionContentContainer>

        {idx !== 0 && (
          <LinkButton
            className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
            onClick={() => removeInstructionData(idx)}
          >
            <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
            Remove
          </LinkButton>
        )}
      </div>
    </div>
  )
}

export default InstructionForm
