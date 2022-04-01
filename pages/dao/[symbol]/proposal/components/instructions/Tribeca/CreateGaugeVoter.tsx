import React, { useState } from 'react'
import * as yup from 'yup'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import useTribecaPrograms from '@hooks/useTribecaPrograms'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import { createGaugeVoterInstruction } from '@tools/sdk/tribeca/instructions/createGaugeVoterInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { TribecaCreateGaugeVoterForm } from '@utils/uiTypes/proposalCreationTypes'
import GovernorSelect from './GovernorSelect'

const CreateGaugeVoter = ({
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
  const { programs } = useTribecaPrograms(tribecaConfiguration)
  const { getGovernedAccountPublicKey } = useGovernedMultiTypeAccounts()
  const {
    connection,
    wallet,
    form,
  } = useInstructionFormBuilder<TribecaCreateGaugeVoterForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
    }),
    buildInstruction: async function () {
      const pubkey = getGovernedAccountPublicKey(form.governedAccount, true)
      if (!pubkey) {
        throw new Error(
          'Error finding governed account pubkey, wrong governance account type'
        )
      }
      if (!programs || !tribecaConfiguration) {
        throw new Error('Error initializing Tribeca configuration')
      }

      return createGaugeVoterInstruction({
        tribecaConfiguration,
        programs,
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
    <GovernorSelect
      tribecaConfiguration={tribecaConfiguration}
      setTribecaConfiguration={setTribecaConfiguration}
    />
  )
}

export default CreateGaugeVoter
