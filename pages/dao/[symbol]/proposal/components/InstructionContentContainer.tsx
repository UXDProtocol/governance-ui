import {
  ComponentInstructionData,
  InstructionEnum,
} from '@utils/uiTypes/proposalCreationTypes'
import React from 'react'
import DryRunInstructionBtn from './DryRunInstructionBtn'

const InstructionContentContainer = ({
  children,
  instruction,
}: {
  children: unknown
  instruction?: ComponentInstructionData
}) => {
  return (
    <div className="space-y-4 w-full">
      {children}

      {instruction?.type?.id !== InstructionEnum.None && (
        <DryRunInstructionBtn
          btnClassNames=""
          getInstructionDataFcn={instruction?.getInstruction}
        />
      )}
    </div>
  )
}

export default InstructionContentContainer
