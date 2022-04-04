import React from 'react'
import * as yup from 'yup'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { createEscrowATAInstruction } from '@tools/sdk/tribeca/instructions/createEscrowSaberATAInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { TribecaCreateEscrowGovernanceTokenATAForm } from '@utils/uiTypes/proposalCreationTypes'
import GovernorSelect from './GovernorSelect'
import { PublicKey } from '@solana/web3.js'
import {
  getTribecaLocker,
  getTribecaPrograms,
} from '@tools/sdk/tribeca/configurations'
import { Wallet } from '@project-serum/common'

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governed account is required'),
  tribecaConfiguration: yup
    .object()
    .nullable()
    .required('Tribeca Configuration governor is required'),
})

const CreateEscrowGovernanceATA = ({
  index,
  governedAccount,
  governedPublicKey,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
  governedPublicKey?: PublicKey
}) => {
  const {
    connection,
    form,
    handleSetForm,
  } = useInstructionFormBuilder<TribecaCreateEscrowGovernanceTokenATAForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
    },
    schema,
    buildInstruction: async function ({ filledForm, connection, wallet }) {
      if (!governedPublicKey) {
        throw new Error(
          'Error finding governed account pubkey, wrong governance account type'
        )
      }
      const programs = getTribecaPrograms({
        connection,
        wallet: wallet as Wallet,
        config: filledForm.tribecaConfiguration!,
      })
      const lockerData = await getTribecaLocker({
        config: filledForm.tribecaConfiguration!,
        programs,
      })
      // FIXME: does not pass this check without refreshing the form
      if (!lockerData) {
        throw new Error('Error initializing Tribeca configuration')
      }

      return createEscrowATAInstruction({
        tribecaConfiguration: filledForm.tribecaConfiguration!,
        lockerData,
        payer: wallet!.publicKey!,
        authority: governedPublicKey,
      })
    },
  })

  // Hardcoded gate used to be clear about what cluster is supported for now
  if (connection.cluster !== 'mainnet') {
    return <>This instruction does not support {connection.cluster}</>
  }

  return (
    <GovernorSelect
      tribecaConfiguration={form.tribecaConfiguration}
      setTribecaConfiguration={(value) =>
        handleSetForm({ propertyName: 'tribecaConfiguration', value })
      }
    />
  )
}

export default CreateEscrowGovernanceATA
