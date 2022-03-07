import * as yup from 'yup'
import BigNumber from 'bignumber.js'
import React, { useContext, useEffect, useState } from 'react'
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'

import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  TokenTransferBetweenInternalGovernanceAccountsForm,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import Input from '@components/inputs/Input'
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts'
import useWalletStore from 'stores/useWalletStore'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'
import TokenAccountSelect from './TokenAccountSelect'
import { PublicKey } from '@solana/web3.js'

const TokenTransferBetweenInternalGovernanceAccounts = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()

  const shouldBeGoverned = index !== 0 && governance
  const [
    form,
    setForm,
  ] = useState<TokenTransferBetweenInternalGovernanceAccountsForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const pubkey = form.governedAccount
    ? getGovernedAccountPublicKey(form.governedAccount)
    : null

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    pubkey ?? undefined
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

    const invalid = {
      serializedInstruction: '',
      isValid: false,
      governance: form.governedAccount?.governance,
    }

    if (
      !connection ||
      !isValid ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.uiAmount ||
      !form.sourceAccount ||
      !form.receiverAccount ||
      !ownedTokenAccountsInfo
    ) {
      return invalid
    }

    if (!pubkey) {
      return invalid
    }

    const { mintDecimals } = ownedTokenAccountsInfo[
      form.sourceAccount.toString()
    ]!

    const amount = new BigNumber(form.uiAmount)
      .shiftedBy(mintDecimals)
      .toNumber()

    const tx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      new PublicKey(form.sourceAccount),
      new PublicKey(form.receiverAccount),
      pubkey,
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
        if (!value || !form.sourceAccount || !ownedTokenAccountsInfo)
          return false

        if (value === form.sourceAccount.toString()) {
          return new yup.ValidationError('source and destination are the same')
        }

        const { mint: mintReceiver } = ownedTokenAccountsInfo[value]
        const { mint: mintSource } = ownedTokenAccountsInfo[
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

      {ownedTokenAccountsInfo ? (
        <>
          <TokenAccountSelect
            label="Source Account"
            value={form.sourceAccount?.toString()}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'sourceAccount' })
            }
            error={formErrors['sourceAccount']}
            ownedTokenAccountsInfo={ownedTokenAccountsInfo}
          />

          <TokenAccountSelect
            label="Receiver Account"
            value={form.receiverAccount?.toString()}
            onChange={(value) =>
              handleSetForm({ value, propertyName: 'receiverAccount' })
            }
            error={formErrors['receiverAccount']}
            ownedTokenAccountsInfo={ownedTokenAccountsInfo}
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
