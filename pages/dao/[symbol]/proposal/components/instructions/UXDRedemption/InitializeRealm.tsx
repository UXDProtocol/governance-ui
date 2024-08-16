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

export interface InitializeRealmForm {
  governedAccount: AssetAccount | null
  redemptionProgramId: PublicKey | null
  liquidInsuranceFundUsdcAmount: number
  phaseOneDuration: number
  phaseTwoDuration: number
  spillWallet: PublicKey | null
}

export default function InitializeRealm({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) {
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [form, setForm] = useState<InitializeRealmForm>({
    governedAccount: null,
    redemptionProgramId: null,
    liquidInsuranceFundUsdcAmount: 0,
    phaseOneDuration: 0,
    phaseTwoDuration: 0,
    spillWallet: null,
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
      uxdRedemptionProgram &&
      form.spillWallet
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
      const utcMint = uxdRedemptionUtils.getUtcMint(
        realmPda,
        uxdRedemptionProgram.programId
      )

      const fundingUsdc = findATAAddrSync(
        form.governedAccount.pubkey,
        usdcMint
      )[0]

      const instruction = await uxdRedemptionProgram.methods
        .initializeRealm({
          uxpTrueCirculatingSupply: new BN(0), // TODO: Will soon not exist anymore, waiting for latest IDL
          liquidInsuranceFundUsdcAmount: new BN(
            form.liquidInsuranceFundUsdcAmount * 10 ** 6
          ),
          phaseOneDurationSeconds: new BN(form.phaseOneDuration),
          phaseTwoDurationSeconds: new BN(form.phaseTwoDuration),
        })
        .accountsStrict({
          payer: wallet.publicKey,
          realm: realmPda,
          authority: form.governedAccount.pubkey,
          spill: form.spillWallet,
          uctMint: utcMint,
          uxpMint: new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M'),
          usdcMint: usdcMint,
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
    liquidInsuranceFundUsdcAmount: yup
      .number()
      .required('Liquid Insurance Fund USDC amount is required')
      .min(1),
    phaseOneDuration: yup
      .number()
      .required('Phase one duration is required')
      .min(1),
    phaseTwoDuration: yup
      .number()
      .required('Phase two duration is required')
      .min(1),
    spillWallet: yup
      .string()
      .required('Spill wallet is required')
      .test(
        'is-spill-wallet-valid',
        'Invalid Spill Wallet',
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
    {
      label: 'Liquid Insurance Fund USDC Amount',
      initialValue: form.liquidInsuranceFundUsdcAmount,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'liquidInsuranceFundUsdcAmount',
    },
    {
      label: 'Phase One Duration (in seconds)',
      initialValue: form.phaseOneDuration,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'phaseOneDuration',
    },
    {
      label: 'Phase Two Duration (in seconds)',
      initialValue: form.phaseTwoDuration,
      type: InstructionInputType.INPUT,
      inputType: 'number',
      name: 'phaseTwoDuration',
    },
    {
      label: 'Spill Wallet',
      initialValue: form.spillWallet,
      type: InstructionInputType.INPUT,
      inputType: 'text',
      name: 'spillWallet',
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
