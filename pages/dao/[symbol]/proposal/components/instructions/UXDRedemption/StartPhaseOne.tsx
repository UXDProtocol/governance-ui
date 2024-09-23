/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
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
import useUXDRedemptionProgram from '@hooks/useUXDRedemptionProgram'
import * as uxdRedemptionUtils from '@tools/sdk/uxdRedemption/utils'

export interface StartPhaseOneForm {
  governedAccount: AssetAccount | null
  redemptionProgramId: PublicKey | null
}

export default function StartPhaseOne({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<StartPhaseOneForm>({
    governedAccount: null,
    redemptionProgramId: null,
  })
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const uxdRedemptionProgram = useUXDRedemptionProgram({
    programId: form.redemptionProgramId,
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
      uxdRedemptionProgram
    ) {
      const realmPda = uxdRedemptionUtils.getRealmPda(
        uxdRedemptionProgram.programId
      )

      const instruction = await uxdRedemptionProgram.methods
        .startPhaseOne()
        .accountsStrict({
          payer: wallet.publicKey,
          realm: realmPda,
          authority: form.governedAccount.pubkey,
        })
        .instruction()

      if (!instruction) throw new Error('Error generating instruction')

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
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
    redemptionProgramId: yup
      .string()
      .required('Redemption program id is required')
      .test(
        'is-redemption-program-id-valid',
        'Invalid Redemption Program ID',
        function (val: string) {
          return val ? validatePubkey(val) : true
        }
      ),
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
      label: 'Redemption Program ID',
      initialValue: form.redemptionProgramId,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'redemptionProgramId',
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
