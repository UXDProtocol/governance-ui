import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'

import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import Select from '@components/inputs/Select'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import { createAssociatedTokenAccount } from '@utils/associated'
import { isFormValid } from '@utils/formValidation'
import { getSplTokenMintAddressByUIName, SPL_TOKENS } from '@utils/splTokens'
import {
  CreateAssociatedTokenAccountForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import Input from '@components/inputs/Input'

const CreateAssociatedTokenAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateAssociatedTokenAccountForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !form.splTokenMintUIName ||
      !wallet?.publicKey
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) {
      return invalid
    }

    const mint =
      form.splTokenMintUIName === 'custom'
        ? form.customMint
        : getSplTokenMintAddressByUIName(form.splTokenMintUIName)

    if (!mint) {
      console.log('Cannot find appropriate mint to create ATA for')
      return invalid
    }

    const [tx] = await createAssociatedTokenAccount(
      // fundingAddress
      wallet.publicKey,

      // walletAddress
      pubkey,

      // splTokenMintAddress
      mint
    )

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    splTokenMintUIName: yup.string().required('SPL Token Mint is required'),
    customMint: yup.string().test((value?: string) => {
      if (form.splTokenMintUIName === 'custom' && !value) {
        return new yup.ValidationError(
          'custom mint must be set when custom is selected'
        )
      }

      return true
    }),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedMultiTypeAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

      <Select
        label="SPL Token Mint"
        value={form.splTokenMintUIName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'splTokenMintUIName' })
        }
        error={formErrors['baseTokenName']}
      >
        {Object.entries(SPL_TOKENS).map(([key, { name, mint }]) => (
          <Select.Option key={key} value={name}>
            <div className="flex flex-col">
              <span>{name}</span>

              <span className="text-gray-500 text-sm">{mint.toString()}</span>
            </div>
          </Select.Option>
        ))}

        <Select.Option key="custom" value="custom">
          Custom
        </Select.Option>
      </Select>

      {form.splTokenMintUIName === 'custom' ? (
        <Input
          label="Custom Mint"
          value={form.customMint}
          type="string"
          onChange={(evt) =>
            handleSetForm({
              value: new PublicKey(evt.target.value),
              propertyName: 'customMint',
            })
          }
          error={formErrors['customMint']}
        />
      ) : null}
    </>
  )
}

export default CreateAssociatedTokenAccount
