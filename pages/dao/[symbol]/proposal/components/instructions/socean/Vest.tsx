import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SoceanVestForm,
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
import { vest } from '@tools/sdk/socean/vest'
import { BN } from '@project-serum/anchor'
import { tryGetTokenMint } from '@utils/tokens'
import BigNumber from 'bignumber.js'

const Vest = ({
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
  const [form, setForm] = useState<SoceanVestForm>({})
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
      !form.bondPool ||
      !form.bondedMint ||
      !form.userBondedAccount ||
      form.uiAmount === void 0
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const mintInfo = await tryGetTokenMint(
      connection.current,
      new PublicKey(form.userBondedAccount)
    )

    if (!mintInfo) throw new Error('Cannot load userBondedAccount mint info')

    const tx = await vest({
      cluster: connection.cluster,
      payer: wallet.publicKey,
      program: programs.Bonding,
      authority: pubkey,
      bondPool: new PublicKey(form.bondPool),
      bondedMint: new PublicKey(form.bondedMint),
      userBondedAccount: new PublicKey(form.userBondedAccount),
      amount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(mintInfo.account.decimals)
          .toString()
      ),
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
    userBondedAccount: yup.string().required('User Bonded Account is required'),
    uiAmount: yup.number().required('Amount is required'),
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
        label="User Bonded Account"
        value={form.userBondedAccount}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'userBondedAccount',
          })
        }
        error={formErrors['userBondedAccount']}
      />

      <Input
        label="Amount"
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

export default Vest
