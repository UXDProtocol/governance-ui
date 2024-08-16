/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid, validatePubkey } from '@utils/formValidation'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { AssetAccount } from '@utils/uiTypes/assets'
import useUXDRedemptionProgram from '@hooks/useUXDRedemptionProgram'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import * as uxdRedemptionUtils from '@tools/sdk/uxdRedemption/utils'
import { findATAAddrSync } from '@utils/ataTools'

export interface DepositIlliquidInsuranceFundIntoRealmUsdcForm {
  governedAccount: AssetAccount | null
  redemptionProgramId: PublicKey | null
  usdcAmount: number
}

export default function DepositIlliquidInsuranceFundIntoRealmUsdc({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [
    form,
    setForm,
  ] = useState<DepositIlliquidInsuranceFundIntoRealmUsdcForm>({
    governedAccount: null,
    redemptionProgramId: null,
    usdcAmount: 0,
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
      const usdcMint = new PublicKey(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      )
      const realmPda = uxdRedemptionUtils.getRealmPda(
        uxdRedemptionProgram.programId
      )
      const realmUsdcPda = uxdRedemptionUtils.getRealmUsdcPda(
        realmPda,
        uxdRedemptionProgram.programId
      )

      const fundingUsdc = findATAAddrSync(
        form.governedAccount.pubkey,
        usdcMint
      )[0]

      const instruction = await uxdRedemptionProgram.methods
        .depositIlliquidInsuranceFundIntoRealmUsdc(
          new BN(form.usdcAmount * 10 ** 6)
        )
        .accountsStrict({
          payer: wallet.publicKey,
          realm: realmPda,
          funding: form.governedAccount.pubkey,
          fundingUsdc,
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          realmUsdc: realmUsdcPda,
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
    usdcAmount: yup.number().required('USDC amount is required').min(1),
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
    {
      label: 'USDC Amount',
      initialValue: form.usdcAmount,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'usdcAmount',
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
