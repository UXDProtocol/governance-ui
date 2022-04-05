/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import { TribecaLockForm } from '@utils/uiTypes/proposalCreationTypes'
import Input from '@components/inputs/Input'
import { BigNumber } from 'bignumber.js'
import { BN } from '@project-serum/anchor'
import GovernorSelect from './GovernorSelect'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import {
  getTribecaLocker,
  getTribecaPrograms,
} from '@tools/sdk/tribeca/configurations'
import { Wallet } from '@project-serum/common'
import Select from '@components/inputs/Select'
import SelectOptionList from '../../SelectOptionList'
import { lockInstruction } from '@tools/sdk/tribeca/instructions/lockInstruction'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  uiAmount: yup
    .number()
    .moreThan(0, 'Amount should be more than 0')
    .required('Amount is required'),
  durationSeconds: yup
    .number()
    // .moreThan(
    //   minDurationSeconds,
    //   `Duration should be more than ${minDurationSeconds}`
    // )
    // .lessThan(
    //   // +1 so maxDurationSeconds is included
    //   maxDurationSeconds + 1,
    //   `Duration should be less than ${maxDurationSeconds + 1}`
    // )
    .required('Duration is required'),
})

const Lock = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    form,
    handleSetForm,
    formErrors,
  } = useInstructionFormBuilder<TribecaLockForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
      uiAmount: 0,
      durationSeconds: 0,
    },
    schema,
    buildInstruction: async function ({
      connection,
      wallet,
      form,
      governedAccountPubkey,
    }) {
      const programs = getTribecaPrograms({
        connection,
        wallet: wallet as Wallet,
        config: form.tribecaConfiguration!,
      })
      const lockerData = await getTribecaLocker({
        programs,
        config: form.tribecaConfiguration!,
      })
      const minDurationSeconds =
        lockerData?.params?.minStakeDuration?.toNumber() ?? 0

      const maxDurationSeconds =
        lockerData?.params?.maxStakeDuration?.toNumber() ?? Number.MAX_VALUE
      console.log('minDurationSeconds', minDurationSeconds)
      console.log('maxDurationSeconds', maxDurationSeconds)
      console.log(
        form.durationSeconds * 60 * 60 * 24 * 365,
        form.durationSeconds * 60 * 60 * 24 * 365
      )
      return lockInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        lockerData,
        authority: governedAccountPubkey,
        amount: new BN(
          new BigNumber(form.uiAmount!)
            .shiftedBy(form.tribecaConfiguration!.token.decimals)
            .toNumber()
        ),
        durationSeconds: new BN(form.durationSeconds * 60 * 60 * 24 * 365),
      })
    },
  })

  return (
    <>
      <GovernorSelect
        tribecaConfiguration={form.tribecaConfiguration}
        setTribecaConfiguration={(value) =>
          handleSetForm({ value, propertyName: 'tribecaConfiguration' })
        }
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

      <Select
        label="Lock Duration in Years"
        value={form.durationSeconds}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'durationSeconds',
          })
        }
        error={formErrors['durationSeconds']}
      >
        <SelectOptionList list={[1, 2, 5]} />
      </Select>

      {/* <Input
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
      /> */}
    </>
  )
}

export default Lock
