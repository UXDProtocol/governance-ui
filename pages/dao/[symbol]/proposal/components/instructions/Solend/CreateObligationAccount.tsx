import React, { useContext, useEffect, useState } from 'react'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import * as yup from 'yup'
import { PublicKey } from '@solana/web3.js'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useRealm from '@hooks/useRealm'
import { createObligationAccount } from '@tools/sdk/solend/createObligationAccount'
import { isFormValid } from '@utils/formValidation'
import {
  CreateSolendObligationAccountForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import useWalletStore from 'stores/useWalletStore'

import { NewProposalContext } from '../../../new'
import GovernedAccountSelect from '../../GovernedAccountSelect'

const CreateObligationAccount = ({
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
  const [form, setForm] = useState<CreateSolendObligationAccountForm>({})
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
      !wallet?.publicKey
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount)

    if (!pubkey) return invalid

    const tx = await createObligationAccount({
      fundingAddress: wallet.publicKey,
      walletAddress: pubkey,
    })

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

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })

  return (
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
  )
}

export default CreateObligationAccount
