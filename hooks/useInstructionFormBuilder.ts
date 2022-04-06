import { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { debounce } from '@utils/debounce'
import { isFormValid } from '@utils/formValidation'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { FormInstructionData } from '@utils/uiTypes/proposalCreationTypes'

import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import useWalletStore from 'stores/useWalletStore'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import useGovernedMultiTypeAccounts from './useGovernedMultiTypeAccounts'

function useInstructionFormBuilder<
  T extends {
    governedAccount?: GovernedMultiTypeAccount
  }
>({
  index,
  initialFormValues,
  schema,
  buildInstruction,
}: {
  index: number
  initialFormValues: T
  schema: yup.ObjectSchema<
    {
      [key in keyof T]: yup.AnySchema
    }
  >
  buildInstruction?: ({
    form,
    connection,
    wallet,
    governedAccountPubkey,
  }: {
    form: T
    connection: Connection
    wallet: SignerWalletAdapter
    governedAccountPubkey: PublicKey
  }) => Promise<TransactionInstruction>
}) {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { handleSetInstruction } = useContext(NewProposalContext)
  const { getGovernedAccountPublicKey } = useGovernedMultiTypeAccounts()

  const [form, setForm] = useState<T>(initialFormValues)
  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateForm = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  const getInstruction = async (): Promise<FormInstructionData> => {
    const governedAccountPubkey = getGovernedAccountPublicKey(
      form.governedAccount,
      true
    )
    if (
      !wallet?.publicKey ||
      !form.governedAccount?.governance?.account ||
      !governedAccountPubkey ||
      !(await validateForm())
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
    try {
      return {
        serializedInstruction: buildInstruction
          ? serializeInstructionToBase64(
            await buildInstruction({
              form,
              connection: connection.current,
              wallet,
              governedAccountPubkey,
            })
          )
          : '',
        isValid: true,
        governance: form.governedAccount?.governance,
      }
    } catch (e) {
      console.error(e)
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'governedAccount',
      value: initialFormValues.governedAccount,
    })
  }, [JSON.stringify(initialFormValues.governedAccount)])

  useEffect(() => {
    console.debug('form', form)
    debounce.debounceFcn(async () => {
      await validateForm()
    })
    handleSetInstruction(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  return {
    connection,
    wallet,
    formErrors,
    form,
    handleSetForm,
    validateForm,
  }
}

export default useInstructionFormBuilder
