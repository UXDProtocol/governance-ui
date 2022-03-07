import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SoceanMintBondedTokensForm,
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
import { mintBondedTokens } from '@tools/sdk/socean/mintBondedTokens'
import { BN } from '@project-serum/anchor'
import Input from '@components/inputs/Input'
import { PublicKey } from '@solana/web3.js'
import { tryGetTokenMint } from '@utils/tokens'
import BigNumber from 'bignumber.js'

const MintBondedTokens = ({
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
  const [form, setForm] = useState<SoceanMintBondedTokensForm>({})
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
      !form.uiAmount ||
      !form.depositFrom ||
      !form.bondPool ||
      !form.bondedMint ||
      !form.mintTo
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const mintInfo = await tryGetTokenMint(
      connection.current,
      new PublicKey(form.depositFrom)
    )

    if (!mintInfo) throw new Error('Cannot load depositFrom mint info')

    const tx = await mintBondedTokens({
      cluster: connection.cluster,
      program: programs.Bonding,
      amount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(mintInfo.account.decimals)
          .toString()
      ),
      depositFrom: new PublicKey(form.depositFrom),
      authority: pubkey,
      bondPool: new PublicKey(form.bondPool),
      bondedMint: new PublicKey(form.bondedMint),
      mintTo: new PublicKey(form.mintTo),
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
    bondPool: yup.string().required('Bond Pool is required'),
    bondedMint: yup.string().required('Bonded Mint is required'),
    depositFrom: yup.string().required('Deposit From is required'),
    mintTo: yup.string().required('Mint To is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
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
        label="Bond Pool"
        value={form.bondPool}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bondPool',
          })
        }
        error={formErrors['bondPool']}
      />

      <Input
        label="Bonded Mint"
        value={form.bondedMint}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'bondedMint',
          })
        }
        error={formErrors['bondedMint']}
      />

      <Input
        label="Deposit From (Sale mint TA/ATA)"
        value={form.depositFrom}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'depositFrom',
          })
        }
        error={formErrors['depositFrom']}
      />

      <Input
        label="Mint to  (Bonded mint TA/ATA)"
        value={form.mintTo}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'mintTo',
          })
        }
        error={formErrors['mintTo']}
      />

      <Input
        label="Amount to mint"
        value={form.uiAmount}
        type="number"
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
  )
}

export default MintBondedTokens
