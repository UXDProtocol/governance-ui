/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import { PublicKey } from '@solana/web3.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import useUXDProgram from '@hooks/useUXDProgram'

export interface SetUXDProgramAdminForm {
  governedAccount: AssetAccount | null
  newAuthority: string | null
}

export default function SetUXDProgramAdmin({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()

  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<SetUXDProgramAdminForm>({
    governedAccount: null,
    newAuthority: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const uxdProgram = useUXDProgram({
    programId: new PublicKey('UXD8m9cvwk4RcSxnX2HZ9VudQCEeDH6fRnB4CAP57Dr'),
  })

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      uxdProgram &&
      form.newAuthority
    ) {
      console.log('NEW AUTHORITY', new PublicKey(form.newAuthority).toBase58())

      const instruction = await uxdProgram.methods
        .editControllerAuthority(new PublicKey(form.newAuthority))
        .accountsStrict({
          authority: new PublicKey(
            'CzZySsi1dRHMitTtNe2P12w3ja2XmfcGgqJBS8ytBhhY'
          ),
          controller: new PublicKey(
            '3tbJcXAWQkFVN26rZPtwkFNvC24sPT35fDxG4M7irLQW'
          ),
        })
        .instruction()

      if (!instruction) throw new Error('Error generating instruction')

      console.log(
        'GOVERNANCE',
        form.governedAccount?.governance.pubkey.toBase58()
      )

      return {
        serializedInstruction: serializeInstructionToBase64(instruction),
        isValid,
        governance: form.governedAccount?.governance,
        chunkBy: 1,
      }
    } else {
      return {
        serializedInstruction: '',
        isValid,
        governance: form.governedAccount?.governance,
        chunkBy: 1,
      }
    }
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form, uxdProgram])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  const inputs: InstructionInput[] = [
    {
      label: 'Governance',
      initialValue: form.governedAccount,
      name: 'governedAccount',
      type: InstructionInputType.GOVERNED_ACCOUNT,
      shouldBeGoverned: shouldBeGoverned as any,
      governance: governance,
      options: assetAccounts,
    },
    {
      label: 'New Authority',
      initialValue: form.newAuthority,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'newAuthority',
    },
  ]

  return (
    <>
      {form && (
        <InstructionForm
          outerForm={form}
          setForm={setForm}
          inputs={inputs}
          setFormErrors={setFormErrors}
          formErrors={formErrors}
        />
      )}
    </>
  )
}
