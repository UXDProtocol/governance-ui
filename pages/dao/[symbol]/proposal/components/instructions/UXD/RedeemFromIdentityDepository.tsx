import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDRedeemFromIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import createRedeemFromIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createRedeemFromIdentityDepositoryInstruction';
import { USDC_DECIMALS } from '@uxd-protocol/uxd-client';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  uiRedeemableAmount: yup
    .number()
    .moreThan(0, 'Redeemable amount should be more than 0')
    .required('Redeemable Amount is required'),
});

const UXDRedeemFromIdentityDepository = ({
  index,
  governedAccount,
}: {
  index: number;
  governedAccount?: GovernedMultiTypeAccount;
}) => {
  const {
    form,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDRedeemFromIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      return createRedeemFromIdentityDepositoryInstruction({
        uxdProgramId: new PublicKey(form.uxdProgram!),
        user: governedAccountPubkey,
        redeemableAmount: form.uiRedeemableAmount!,
        payer: wallet.publicKey!,
        collateralMint: new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),
        collateralMintSymbol: 'USDC',
        collateralMintDecimals: USDC_DECIMALS,
      });
    },
  });

  return (
    <>
      <Input
        label="UXD Program"
        value={form.uxdProgram}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uxdProgram',
          })
        }
        error={formErrors['uxdProgram']}
      />

      <Input
        label="Redeemable Amount (UXD)"
        value={form.uiRedeemableAmount}
        type="number"
        min={0}
        max={10 ** 12}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRedeemableAmount',
          })
        }
        error={formErrors['uiRedeemableAmount']}
      />
    </>
  );
};

export default UXDRedeemFromIdentityDepository;
