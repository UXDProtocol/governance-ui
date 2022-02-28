import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SoceanDepositToAuctionPoolForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import useWalletStore from 'stores/useWalletStore'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useSoceanPrograms from '@hooks/useSoceanPrograms'
import Input from '@components/inputs/Input'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { depositToAuctionPool } from '@tools/sdk/socean/depositToAuctionPool'

const DepositToAuctionPool = ({
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
  const { programs } = useSoceanPrograms()

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<SoceanDepositToAuctionPoolForm>({})
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
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !programs ||
      !form.nativeDepositAmount ||
      !form.auction ||
      !form.sourceAccount ||
      !form.bondedMint
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await depositToAuctionPool({
      cluster: connection.cluster,
      program: programs.DescendingAuction,
      depositAmount: new BN(form.nativeDepositAmount),
      auction: form.auction,
      authority: pubkey,
      sourceAccount: form.sourceAccount,
      bondedMint: form.bondedMint,
    })

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
    auction: yup.string().required('Auction is required'),
    sourceAccount: yup.string().required('Source account is required'),
    bondedMint: yup.string().required('Bonded mint is required'),
    nativeDepositAmount: yup
      .number()
      .moreThan(0, 'Native deposit amount should be more than 0')
      .required('Native deposit amount is required'),
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

      <Input
        label="Auction"
        value={form.auction}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'auction',
          })
        }
        error={formErrors['auction']}
      />

      <Input
        label="Source account (bonded mint TA/ATA)"
        value={form.sourceAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'sourceAccount',
          })
        }
        error={formErrors['sourceAccount']}
      />

      <Input
        label="Bonded Mint"
        value={form.bondedMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: new PublicKey(evt.target.value),
            propertyName: 'bondedMint',
          })
        }
        error={formErrors['bondedMint']}
      />

      <Input
        label="Native Deposit Amount"
        value={form.nativeDepositAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'nativeDepositAmount',
          })
        }
        error={formErrors['nativeDepositAmount']}
      />
    </>
  )
}

export default DepositToAuctionPool
