import * as yup from 'yup'
import Input from '@components/inputs/Input'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import createSetMangoDepositoriesRedeemableSoftCapInstruction from '@tools/sdk/uxdProtocol/createSetMangoDepositoriesRedeemableSoftCapInstruction'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { SetMangoDepositoriesRedeemableSoftCapForm } from '@utils/uiTypes/proposalCreationTypes'

const SetMangoDepositoriesRedeemableSoftCap = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount: GovernedMultiTypeAccount | undefined
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<SetMangoDepositoriesRedeemableSoftCapForm>({
    index,
    initialFormValues: {
      governedAccount,
      softCap: 0,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Program governed account is required'),
      softCap: yup
        .number()
        .moreThan(0, 'Redeemable soft cap should be more than 0')
        .required('Redeemable soft cap is required'),
    }),
    buildInstruction: async function () {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance')
      }
      return createSetMangoDepositoriesRedeemableSoftCapInstruction(
        form.governedAccount!.governance.account.governedAccount,
        form.softCap,
        form.governedAccount!.governance.pubkey
      )
    },
  })

  return (
    <Input
      label="Redeem Global Supply Cap"
      value={form.softCap}
      type="number"
      min={0}
      onChange={(evt) =>
        handleSetForm({
          value: evt.target.value,
          propertyName: 'softCap',
        })
      }
      error={formErrors['softCap']}
    />
  )
}

export default SetMangoDepositoriesRedeemableSoftCap
