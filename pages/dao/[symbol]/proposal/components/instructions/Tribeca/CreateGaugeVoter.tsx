import * as yup from 'yup'
import { Wallet } from '@project-serum/common'
import { PublicKey } from '@solana/web3.js'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { getTribecaPrograms } from '@tools/sdk/tribeca/configurations'
import { createGaugeVoterInstruction } from '@tools/sdk/tribeca/instructions/createGaugeVoterInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { TribecaCreateGaugeVoterForm } from '@utils/uiTypes/proposalCreationTypes'
import GovernorSelect from './GovernorSelect'

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

const CreateGaugeVoter = ({
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
  } = useInstructionFormBuilder<TribecaCreateGaugeVoterForm>({
    index,
    initialFormValues: {
      governedAccount,
      tribecaConfiguration: null,
    },
    schema,
    buildInstruction: async function ({ wallet, connection, filledForm }) {
      if (!governedPublicKey) {
        throw new Error(
          'Error finding governed account pubkey, wrong governance account type'
        )
      }
      const programs = getTribecaPrograms({
        wallet: wallet as Wallet,
        connection,
        config: filledForm.tribecaConfiguration!,
      })
      if (!programs) {
        throw new Error('Error initializing Tribeca configuration')
      }

      return createGaugeVoterInstruction({
        tribecaConfiguration: form.tribecaConfiguration!,
        programs,
        payer: wallet.publicKey!,
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

export default CreateGaugeVoter
