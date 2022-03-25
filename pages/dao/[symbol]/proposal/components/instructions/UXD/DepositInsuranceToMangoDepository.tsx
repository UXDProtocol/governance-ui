import * as yup from 'yup'
import Input from '@components/inputs/Input'
import Select from '@components/inputs/Select'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import createDepositInsuranceToMangoDepositoryInstruction from '@tools/sdk/uxdProtocol/createDepositInsuranceToMangoDepositoryInstruction'
import {
  getDepositoryMintSymbols,
  getInsuranceMintSymbols,
} from '@tools/sdk/uxdProtocol/uxdClient'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { DepositInsuranceToMangoDepositoryForm } from '@utils/uiTypes/proposalCreationTypes'
import SelectOptionList from '../../SelectOptionList'

const UXDDepositInsuranceToMangoDepository = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount: GovernedMultiTypeAccount | undefined
}) => {
  const {
    connection,
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<DepositInsuranceToMangoDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
      insuranceDepositedAmount: 0,
    },
    schema: yup.object().shape({
      collateralName: yup
        .string()
        .required('Collateral Name address is required'),
      insuranceName: yup
        .string()
        .required('Insurance Name address is required'),
      insuranceDepositedAmount: yup
        .number()
        .moreThan(0, 'Insurance Deposited amount should be more than 0')
        .required('Insurance Deposited amount is required'),
      governedAccount: yup
        .object()
        .nullable()
        .required('Program governed account is required'),
    }),
    buildInstruction: async function () {
      if (!governedAccount?.governance?.account) {
        throw new Error('Governance must be a Program Account Governance')
      }
      if (
        !form.collateralName ||
        !form.insuranceName ||
        !form.insuranceDepositedAmount
      ) {
        throw new Error('missing form parameter')
      }
      return createDepositInsuranceToMangoDepositoryInstruction(
        connection,
        form.governedAccount!.governance!.account.governedAccount,
        form.governedAccount!.governance!.pubkey,
        form.collateralName,
        form.insuranceName,
        form.insuranceDepositedAmount
      )
    },
  })

  return (
    <>
      <Select
        label="Collateral Name"
        value={form.collateralName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'collateralName' })
        }
        error={formErrors['collateralName']}
      >
        <SelectOptionList list={getDepositoryMintSymbols(connection.cluster)} />
      </Select>

      <Select
        label="Insurance Name"
        value={form.insuranceName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'insuranceName' })
        }
        error={formErrors['insuranceName']}
      >
        <SelectOptionList list={getInsuranceMintSymbols(connection.cluster)} />
      </Select>

      <Input
        label="Insurance Deposited Amount"
        value={form.insuranceDepositedAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'insuranceDepositedAmount',
          })
        }
        error={formErrors['insuranceDepositedAmount']}
      />
    </>
  )
}

export default UXDDepositInsuranceToMangoDepository
