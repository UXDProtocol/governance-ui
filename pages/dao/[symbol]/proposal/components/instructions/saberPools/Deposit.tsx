import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import BigNumber from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import { isFormValid } from '@utils/formValidation'
import { PublicKey } from '@solana/web3.js'
import {
  UiInstruction,
  SaberPoolsDepositForm,
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
import { deposit } from '@tools/sdk/saberPools/deposit'
import saberPoolsConfiguration, {
  Pool,
} from '@tools/sdk/saberPools/configuration'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'

const Deposit = ({
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
  const [pool, setPool] = useState<Pool | null>(null)
  const [form, setForm] = useState<SaberPoolsDepositForm>({})
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
      !form.sourceA ||
      !form.sourceB ||
      !form.poolName ||
      !pool ||
      form.uiTokenAmountA === void 0 ||
      form.uiTokenAmountB === void 0 ||
      form.uiMinimumPoolTokenAmount === void 0
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await deposit({
      authority: pubkey,
      pool,
      sourceA: new PublicKey(form.sourceA),
      sourceB: new PublicKey(form.sourceB),

      tokenAmountA: new BN(
        new BigNumber(form.uiTokenAmountA)
          .shiftedBy(pool.tokenAccountA.decimals)
          .toString()
      ),

      tokenAmountB: new BN(
        new BigNumber(form.uiTokenAmountB)
          .shiftedBy(pool.tokenAccountB.decimals)
          .toString()
      ),

      minimumPoolTokenAmount: new BN(
        new BigNumber(form.uiMinimumPoolTokenAmount)
          .shiftedBy(pool.poolToken.decimals)
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

      <Select
        label="Pool"
        value={form.poolName}
        placeholder="Please select..."
        onChange={(value) => {
          handleSetForm({
            value,
            propertyName: 'poolName',
          })

          setPool(saberPoolsConfiguration.pools[value] ?? null)
        }}
        error={formErrors['poolName']}
      >
        {Object.keys(saberPoolsConfiguration.pools).map((name) => (
          <Select.Option key={name} value={name}>
            {name}
          </Select.Option>
        ))}
      </Select>

      {pool ? (
        <>
          <Input
            label={`${pool.tokenAccountA.name} Source Account`}
            value={form.sourceA}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'sourceA',
              })
            }
            error={formErrors['sourceA']}
          />

          <Input
            label={`${pool.tokenAccountB.name} Source Account`}
            value={form.sourceB}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'sourceB',
              })
            }
            error={formErrors['sourceB']}
          />

          <Input
            label={`${pool.tokenAccountA.name} Amount`}
            value={form.uiTokenAmountA}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountA',
              })
            }
            error={formErrors['uiTokenAmountA']}
          />

          <Input
            label={`${pool.tokenAccountB.name} Amount`}
            value={form.uiTokenAmountB}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiTokenAmountB',
              })
            }
            error={formErrors['uiTokenAmountB']}
          />

          <Input
            label={`${pool.poolToken.name} Minimum Amount`}
            value={form.uiMinimumPoolTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumPoolTokenAmount',
              })
            }
            error={formErrors['uiMinimumPoolTokenAmount']}
          />
        </>
      ) : null}
    </>
  )
}

export default Deposit
