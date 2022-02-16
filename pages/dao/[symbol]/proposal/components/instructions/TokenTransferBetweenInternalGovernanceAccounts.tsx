/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import BigNumber from 'bignumber.js'
import {
  UiInstruction,
  TokenTransferBetweenInternalGovernanceAccountsForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import Input from '@components/inputs/Input'
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts'
import TokenAccountSelect from './TokenAccountSelect'

const TokenTransferBetweenInternalGovernanceAccounts = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const [
    form,
    setForm,
  ] = useState<TokenTransferBetweenInternalGovernanceAccountsForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const { ownedTokenAccounts } = useGovernanceUnderlyingTokenAccounts(
    form.governedAccount?.governance.pubkey
  )

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

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.uiAmount ||
      !form.sourceAccount ||
      !form.receiverAccount ||
      !ownedTokenAccounts
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const { mintDecimals } = ownedTokenAccounts[form.sourceAccount.toString()]!

    const amount = new BigNumber(form.uiAmount)
      .shiftedBy(mintDecimals)
      .toNumber()

    const tx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      form.sourceAccount,
      form.receiverAccount,
      form.governedAccount.governance.pubkey,
      [],
      amount
    )

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

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
    sourceAccount: yup.string().required('Source Account is required'),
    receiverAccount: yup
      .string()
      .required('Receiver Account is required')
      .test((value?: string) => {
        if (!value || !form.sourceAccount || !ownedTokenAccounts) return false

        if (value === form.sourceAccount.toString()) {
          return new yup.ValidationError('source and destination are the same')
        }

        const { mint: mintReceiver } = ownedTokenAccounts[value]
        const { mint: mintSource } = ownedTokenAccounts[
          form.sourceAccount.toString()
        ]

        const equals = mintSource.equals(mintReceiver)

        if (!equals) {
          return new yup.ValidationError(
            'source and destination mint are different'
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
      ></GovernedAccountSelect>

      {ownedTokenAccounts ? (
        <>
          <TokenAccountSelect
            label="Source Account"
            value={form.sourceAccount?.toString()}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'sourceAccount' })
            }
            error={formErrors['sourceAccount']}
            ownedTokenAccounts={ownedTokenAccounts}
          />

          <TokenAccountSelect
            label="Receiver Account"
            value={form.receiverAccount?.toString()}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'receiverAccount' })
            }
            error={formErrors['receiverAccount']}
            ownedTokenAccounts={ownedTokenAccounts}
          />

          <Input
            label="Amount to transfer"
            value={form.uiAmount}
            type="string"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiAmount',
              })
            }
            error={formErrors['uiAmount']}
          />
        </>
      ) : null}
    </>
  )
}

export default TokenTransferBetweenInternalGovernanceAccounts
