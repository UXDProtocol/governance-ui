/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import Select from '@components/inputs/Select'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import SolendConfiguration from '@tools/sdk/solend/configuration'
import { refreshReserve } from '@tools/sdk/solend/refreshReserve'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { RefreshReserveForm } from '@utils/uiTypes/proposalCreationTypes'

const RefreshReserve = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<RefreshReserveForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      mintName: yup.string().required('Token Name is required'),
    }),
    buildInstruction: async function () {
      if (!form.mintName)
        throw new Error('invalid form, missing mintName field')
      return refreshReserve({
        mintName: form.mintName,
      })
    },
  })

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  return (
    <Select
      label="Token Name to refresh reserve for"
      value={form.mintName}
      placeholder="Please select..."
      onChange={(value) => handleSetForm({ value, propertyName: 'mintName' })}
      error={formErrors['baseTokenName']}
    >
      {SolendConfiguration.getSupportedMintNames().map((value) => (
        <Select.Option key={value} value={value}>
          {value}
        </Select.Option>
      ))}
    </Select>
  )
}

export default RefreshReserve
