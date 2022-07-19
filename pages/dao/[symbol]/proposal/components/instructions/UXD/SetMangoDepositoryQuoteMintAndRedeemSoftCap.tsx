import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDSetMangoDepositoryQuoteMintAndRedeemSoftCapForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import createSetMangoDepositoryQuoteMintAndRedeemSoftCapInstruction from '@tools/sdk/uxdProtocol/createSetMangoDepositoryQuoteMintAndRedeemSoftCapInstruction';
import useWalletStore from 'stores/useWalletStore';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  softCapUiAmount: yup
    .number()
    .moreThan(0, 'Soft Cap Amount should be more than 0')
    .required('Soft Cap Amount fee is required'),
});

const UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const connection = useWalletStore((s) => s.connection);

  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDSetMangoDepositoryQuoteMintAndRedeemSoftCapForm>(
    {
      index,
      initialFormValues: {
        governedAccount,
      },
      schema,

      buildInstruction: async function ({ form, governedAccountPubkey }) {
        return createSetMangoDepositoryQuoteMintAndRedeemSoftCapInstruction({
          connection,
          uxdProgramId: form.governedAccount!.governance!.account
            .governedAccount,
          authority: governedAccountPubkey,
          // The underlying function just want to extract the quote
          depositoryMintName: 'SOL',
          insuranceMintName: 'USDC',
          // -----
          softCapUiAmount: form.softCapUiAmount!,
        });
      },
    },
  );

  return (
    <>
      <Input
        label="Soft Cap Amount"
        value={form.softCapUiAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'softCapUiAmount',
          })
        }
        error={formErrors['softCapUiAmount']}
      />
    </>
  );
};

export default UXDSetMangoDepositoryQuoteMintAndRedeemSoftCap;
