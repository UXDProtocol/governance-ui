import React, { useState } from 'react'
import * as yup from 'yup'
import useGovernedMultiTypeAccounts from '@hooks/useGovernedMultiTypeAccounts'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import useTribecaLockerData from '@hooks/useTribecaLockerData'
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration'
import { createEscrowATAInstruction } from '@tools/sdk/tribeca/instructions/createEscrowSaberATAInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { TribecaCreateEscrowGovernanceTokenATAForm } from '@utils/uiTypes/proposalCreationTypes'
import GovernorSelect from './GovernorSelect'

const CreateEscrowGovernanceATA = ({
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
  const {
    connection,
    wallet,
    form,
  } = useInstructionFormBuilder<TribecaCreateEscrowGovernanceTokenATAForm>({
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

      // FIXME: does not pass this check without refreshing the form
      if (!tribecaConfiguration || !lockerData) {
        throw new Error('Error initializing Tribeca configuration')
      }

      return createEscrowATAInstruction({
        tribecaConfiguration,
        lockerData,
        payer: wallet!.publicKey!,
        authority: pubkey,
      })
    },
  })
  const { lockerData } = useTribecaLockerData(tribecaConfiguration)

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

export default CreateEscrowGovernanceATA
