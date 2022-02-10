/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  SaberTribecaLockForm,
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
import saberTribecaConfiguration from '@tools/sdk/saberTribeca/configuration'
import Input from '@components/inputs/Input'
import { lockInstruction } from '@tools/sdk/saberTribeca/lockInstruction'
import { BigNumber } from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import useSaberTribeca from '@hooks/useSaberTribeca'

const Lock = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { realmInfo } = useRealm()
  const { governedMultiTypeAccounts } = useGovernedMultiTypeAccounts()
  const { lockerProgram, lockerData } = useSaberTribeca()

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SaberTribecaLockForm>({})
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

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !wallet?.publicKey ||
      !form.uiAmount ||
      !form.durationSeconds ||
      !lockerProgram ||
      !lockerData
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const tx = await lockInstruction({
      lockerProgram,
      lockerData,
      authority: form.governedAccount.governance.pubkey,
      amount: new BN(
        new BigNumber(form.uiAmount)
          .shiftedBy(saberTribecaConfiguration.saberToken.decimals)
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
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

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
      ></GovernedAccountSelect>

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
