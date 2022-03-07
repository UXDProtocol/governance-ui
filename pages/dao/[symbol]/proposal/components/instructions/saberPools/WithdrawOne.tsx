import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import BigNumber from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SaberPoolsWithdrawOneForm,
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
import saberPoolsConfiguration, {
  Pool,
} from '@tools/sdk/saberPools/configuration'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import { withdrawOne } from '@tools/sdk/saberPools/withdrawOne'
import { PublicKey } from '@solana/web3.js'

const WithdrawOne = ({
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
  const [form, setForm] = useState<SaberPoolsWithdrawOneForm>({})
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
      !form.destinationAccount ||
      !pool ||
      !form.baseTokenName ||
      form.uiPoolTokenAmount === void 0 ||
      form.uiMinimumTokenAmount === void 0
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await withdrawOne({
      authority: pubkey,
      pool,
      destinationAccount: new PublicKey(form.destinationAccount),
      baseTokenName: form.baseTokenName,
      poolTokenAmount: new BN(
        new BigNumber(form.uiPoolTokenAmount)
          .shiftedBy(pool.poolToken.decimals)
          .toString()
      ),
      minimumTokenAmount: new BN(
        new BigNumber(form.uiMinimumTokenAmount)
          .shiftedBy(
            form.baseTokenName === pool.tokenAccountA.name
              ? pool.tokenAccountA.decimals
              : pool.tokenAccountB.decimals
          )
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
          <Select
            label="Token to Withdraw"
            value={form.baseTokenName}
            placeholder="Please select..."
            onChange={(value) => {
              handleSetForm({
                value,
                propertyName: 'baseTokenName',
              })
            }}
            error={formErrors['baseTokenName']}
          >
            <Select.Option value={pool.tokenAccountA.name}>
              {pool.tokenAccountA.name}
            </Select.Option>

            <Select.Option value={pool.tokenAccountB.name}>
              {pool.tokenAccountB.name}
            </Select.Option>
          </Select>

          <Input
            label={`${
              form.baseTokenName ? `${form.baseTokenName} ` : ''
            }Destination Account`}
            value={form.destinationAccount}
            type="string"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'destinationAccount',
              })
            }
            error={formErrors['destinationAccount']}
          />

          <Input
            label={`${pool.poolToken.name} Amount To Withdraw`}
            value={form.uiPoolTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiPoolTokenAmount',
              })
            }
            error={formErrors['uiPoolTokenAmount']}
          />

          <Input
            label={`Minimum ${
              form.baseTokenName ? `${form.baseTokenName} ` : ''
            }Amount To Withdraw`}
            value={form.uiMinimumTokenAmount}
            type="number"
            min="0"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'uiMinimumTokenAmount',
              })
            }
            error={formErrors['uiMinimumTokenAmount']}
          />
        </>
      ) : null}
    </>
  )
}

export default WithdrawOne
