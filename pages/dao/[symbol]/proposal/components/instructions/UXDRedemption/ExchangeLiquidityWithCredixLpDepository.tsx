/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
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
import { AssetAccount } from '@utils/uiTypes/assets'
import useUXDProgram from '@hooks/useUXDProgram'
import { BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

export interface ExchangeLiquidityWithCredixLpDepositoryForm {
  governedAccount: AssetAccount | null
  amount: number | null
}

export default function ExchangeLiquidityWithCredixLpDepository({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()

  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<ExchangeLiquidityWithCredixLpDepositoryForm>(
    {
      governedAccount: null,
      amount: null,
    }
  )
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
      form.amount
    ) {
      const instruction = await uxdProgram.methods
        .exchangeLiquidityWithCredixLpDepository(new BN(form.amount * 10 ** 6))
        .accountsStrict({
          controller: new PublicKey(
            '3tbJcXAWQkFVN26rZPtwkFNvC24sPT35fDxG4M7irLQW'
          ),
          identityDepository: new PublicKey(
            'BgkHf7mAtNwtnu2uCJqSJWbFdiXCoMBpNZmgVJJmsGLW'
          ),
          credixLpDepository: new PublicKey(
            'AGqtEsmCnzQNbSQzM6qmTZ4M5nhJ8WP8CbdNh6eQBuWF'
          ),
          payer: wallet.publicKey,
          user: new PublicKey('9sPyx1M4WL2s4mAZqCGAGtAiVjXdE5jQVGTa7XQdCMo'),
          identityDepositoryCollateral: new PublicKey(
            '5dT7SJWz9kLFF5jA9czkSwwMeUhHj76mhF1jtvdbAoSL'
          ),
          credixLpDepositoryShares: new PublicKey(
            'HmVfQWSHurAC7jhgZe61Xk3GN3ca2c3McbNY2L97Vg3e'
          ),
          userCollateral: new PublicKey(
            'GXuTd1s3mDTdPgrcqcsxCxedfSLnfVHU69sUWX1Tn5qj'
          ), // USDC ATA new DAO
          receiverCredixShares: new PublicKey(
            '2uQWHGwADKGqFr2zNJG4QTJBicTPY9FqMXKHJQkXzs8f'
          ), // Credix LP ATA new DAO
          collateralMint: new PublicKey(
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
          ),
          credixSharesMint: new PublicKey(
            '8C3t7mmndSSZUukZHrVuU2mJ3bPtpVRo6tKNbLovGQEJ'
          ),
          systemProgram: SYSTEM_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
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
      label: 'Amount',
      initialValue: form.amount,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'amount',
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
