/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  TribecaLockForm,
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
import Input from '@components/inputs/Input'
import { lockInstruction } from '@tools/sdk/tribeca/lockInstruction'
import { BigNumber } from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import useTribecaLockerData from '@hooks/useTribecaLockerData'
import GovernorSelect from './GovernorSelect'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'

const Lock = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const [
    tribecaConfiguration,
    setTribecaConfiguration,
  ] = useState<ATribecaConfiguration | null>(null)

  const {
    governedMultiTypeAccounts,
    getGovernedAccountPublicKey,
  } = useGovernedMultiTypeAccounts()
  const { programs, lockerData } = useTribecaLockerData(tribecaConfiguration)

  const shouldBeGoverned = index !== 0 && governance
  const [form, setForm] = useState<TribecaLockForm>({})
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
      !form.uiAmount ||
      !form.durationSeconds ||
      !programs ||
      !lockerData ||
      !tribecaConfiguration
    ) {
      return invalid
    }

    const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)

    if (!pubkey) return invalid

    const tx = await lockInstruction({
      tribecaConfiguration,
      programs,
      lockerData,
      authority: pubkey,
      amount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(tribecaConfiguration.token.decimals)
          .toNumber()
      ),
      durationSeconds: new BN(form.durationSeconds),
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
  }, [form, tribecaConfiguration, programs, lockerData])

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const minDurationSeconds =
    lockerData?.params?.minStakeDuration?.toNumber() ?? 0

  const maxDurationSeconds =
    lockerData?.params?.maxStakeDuration?.toNumber() ?? Number.MAX_VALUE

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    uiAmount: yup
      .number()
      .moreThan(0, 'Amount should be more than 0')
      .required('Amount is required'),
    durationSeconds: yup
      .number()
      .moreThan(
        minDurationSeconds,
        `Duration should be more than ${minDurationSeconds}`
      )
      .lessThan(
        maxDurationSeconds,
        `Duration should be less than ${maxDurationSeconds}`
      )
      .required('Duration is required'),
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

      <GovernorSelect
        tribecaConfiguration={tribecaConfiguration}
        setTribecaConfiguration={setTribecaConfiguration}
      />

      <Input
        label="Amount to lock"
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

      <Input
        label="Duration in seconds"
        value={form.durationSeconds}
        type="number"
        min={minDurationSeconds}
        max={maxDurationSeconds}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'durationSeconds',
          })
        }
        error={formErrors['durationSeconds']}
      />
    </>
  )
}

export default Lock
