import * as yup from 'yup';
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder';
import { GovernedMultiTypeAccount } from '@utils/tokens';
import { UXDMintWithIdentityDepositoryForm } from '@utils/uiTypes/proposalCreationTypes';
import Input from '@components/inputs/Input';
import { PublicKey } from '@solana/web3.js';
import createMintWithIdentityDepositoryInstruction from '@tools/sdk/uxdProtocol/createMintWithIdentityDepositoryInstruction';
import { USDC, USDC_DECIMALS } from '@uxd-protocol/uxd-client';
import InputNumber from '@components/inputs/InputNumber';

const schema = yup.object().shape({
  governedAccount: yup
    .object()
    .nullable()
    .required('Governance account is required'),
  uxdProgram: yup.string().required('UXD Program address is required'),
  uiCollateralAmount: yup
    .number()
    .moreThan(0, 'Collateral amount should be more than 0')
    .required('Collateral Amount is required'),
});

const UXDMintWithIdentityDepository = ({
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
  } = useInstructionFormBuilder<UXDMintWithIdentityDepositoryForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema,
    shouldSplitIntoSeparateTxs: true,
    buildInstruction: async function ({ form, governedAccountPubkey, wallet }) {
      // program: HtBAjXoadvKg8KBAtcUL1BjgxM55itScsZYe9LHt3NiP

      return createMintWithIdentityDepositoryInstruction({
        uxdProgramId: new PublicKey(form.uxdProgram!),
        authority: governedAccountPubkey,
        user: governedAccountPubkey,
        collateralAmount: form.uiCollateralAmount!,
        payer: wallet.publicKey!,
        collateralMint: USDC /*new PublicKey(
          '6L9fgyYtbz34JvwvYyL6YzJDAywz9PKGttuZuWyuoqje',
        ),*/,
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

      <InputNumber
        label="Collateral Amount (USDC)"
        value={form.uiCollateralAmount}
        min={0}
        max={10 ** 12}
        onChange={(value) =>
          handleSetForm({
            value: value,
            propertyName: 'uiCollateralAmount',
          })
        }
        error={formErrors['uiCollateralAmount']}
      />
    </>
  );
};

export default UXDMintWithIdentityDepository;
