import React, { useState } from 'react'
import * as yup from 'yup'
import { TribecaCreateGaugeVoteForm } from '@utils/uiTypes/proposalCreationTypes'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useTribecaGauge from '@hooks/useTribecaGauge'
import GaugeSelect from './GaugeSelect'
import GovernorSelect from './GovernorSelect'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { createGaugeVoteInstruction } from '@tools/sdk/tribeca/instructions/createGaugeVoteInstruction'

const CreateGaugeVote = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const [
    tribecaConfiguration,
    setTribecaConfiguration,
  ] = useState<ATribecaConfiguration | null>(null)

  const { getGovernedAccountPublicKey } = useGovernedMultiTypeAccounts()
  const { gauges, programs } = useTribecaGauge(tribecaConfiguration)
  const {
    connection,
    wallet,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaCreateGaugeVoteForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      gaugeName: yup.string().required('Gauge is required'),
    }),
    buildInstruction: async function () {
      const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)
      if (!pubkey) {
        throw new Error(
          'Error finding governed account pubkey, wrong governance account type'
        )
      }
      if (
        !programs ||
        !gauges ||
        !gauges[form.gaugeName!] ||
        !tribecaConfiguration
      ) {
        throw new Error('Error initializing Tribeca configuration')
      }

      return createGaugeVoteInstruction({
        tribecaConfiguration,
        programs,
        gauge: gauges[form.gaugeName!].mint,
        payer: wallet!.publicKey!,
        authority: pubkey,
      })
    },
  })

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  return (
    <>
      <GovernorSelect
        tribecaConfiguration={tribecaConfiguration}
        setTribecaConfiguration={setTribecaConfiguration}
      />

      <GaugeSelect
        gauges={gauges}
        value={form.gaugeName}
        onChange={(value) =>
          handleSetForm({
            value,
            propertyName: 'gaugeName',
          })
        }
        error={formErrors['gaugeName']}
      />
    </>
  )
}

export default CreateGaugeVote
