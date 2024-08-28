/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import mapleFinanceConfig, {
  MapleFinance,
} from '@tools/sdk/mapleFinance/configuration'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import InstructionForm, { InstructionInput } from '../FormCreator'
import { InstructionInputType } from '../inputInstructionType'
import { NewProposalContext } from '../../../new'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { BN } from '@coral-xyz/anchor'
import withdrawalRequestInitialize from '@tools/sdk/mapleFinance/instructions/withdrawalRequestInitialize'
import { AssetAccount } from '@utils/uiTypes/assets'
import { PublicKey } from '@solana/web3.js'

export interface MapleFinanceWithdrawalRequestInitializeForm {
  governedAccount?: AssetAccount | null
  uiWithdrawSharesAmount?: number
}

export default function WithdrawalRequestInitialize({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<MapleFinanceWithdrawalRequestInitializeForm>(
    {}
  )
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

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
      wallet?.publicKey
    ) {
      console.log('form.governedAccount', form.governedAccount)
      console.log(
        'form.governedAccount.pubkey',
        form.governedAccount.pubkey.toBase58()
      )
      console.log(
        'form.governance.owner',
        form.governedAccount.governance.owner.toBase58()
      )
      console.log(
        'form.governedAccount.governance.pubkey',
        form.governedAccount.governance.pubkey.toBase58()
      )

      const programs = mapleFinanceConfig.getMapleFinancePrograms({
        connection: connection.current,
        wallet,
      })

      const instruction = await withdrawalRequestInitialize({
        authority: new PublicKey(
          '9uM8UiGnpbVUUo3XMiESD54PDQbdLcwdunqQMebaFu2r'
        ),
        programs,
        withdrawSharesAmount: new BN(
          form.uiWithdrawSharesAmount! *
            10 ** MapleFinance.pools['Cash Management USDC'].baseMint.decimals
        ),
        poolName: 'Cash Management USDC',
      })

      return {
        serializedInstruction: serializeInstructionToBase64(instruction),
        isValid,
        governance: form.governedAccount?.governance,
        chunkBy: 1,
      }
    }

    return {
      serializedInstruction: '',
      isValid,
      governance: form.governedAccount?.governance,
      chunkBy: 1,
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
      label: 'Withdraw Shares Amount',
      initialValue: form.uiWithdrawSharesAmount,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'uiWithdrawSharesAmount',
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
