import Button from 'components/Button';
import Input from 'components/inputs/Input';
import PreviousRouteBtn from 'components/PreviousRouteBtn';
import Tooltip from 'components/Tooltip';
import { tryParseKey } from 'tools/validators/pubkey';
import { isFormValid } from 'utils/formValidation';
import React, { useEffect, useState } from 'react';
import useWalletStore from 'stores/useWalletStore';
import * as yup from 'yup';
import BaseGovernanceForm, {
  BaseGovernanceFormFields,
} from './BaseGovernanceForm';
import Switch from 'components/Switch';
import { debounce } from '@utils/debounce';
import { MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY } from '@tools/constants';
interface NewProgramForm extends BaseGovernanceFormFields {
  programId: string;
  transferAuthority: boolean;
}

const defaultFormValues = {
  programId: '',
  // TODO: This is temp. fix to avoid wrong default for Multisig DAOs
  // This should be dynamic and set to 1% of the community mint supply or
  // MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY when supply is 0
  minCommunityTokensToCreateProposal: MIN_COMMUNITY_TOKENS_TO_CREATE_W_0_SUPPLY,
  minInstructionHoldUpTime: 0,
  maxVotingTime: 3,
  voteThreshold: 60,
  transferAuthority: true,
};
const NewProgramForm = () => {
  const connection = useWalletStore((s) => s.connection);
  const connected = useWalletStore((s) => s.connected);
  const [form, setForm] = useState<NewProgramForm>({
    ...defaultFormValues,
  });
  const [isLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({});
    setForm({ ...form, [propertyName]: value });
  };
  const handleCreate = async () => {
    throw new Error('Not handled anymore in the fork');
  };
  //if you altering this look at useEffect for form.programId
  const schema = yup.object().shape({
    programId: yup
      .string()
      .test(
        'programIdTest',
        'program id validation error',
        async function (val: string) {
          if (val) {
            try {
              const pubKey = tryParseKey(val);
              if (!pubKey) {
                return this.createError({
                  message: `Invalid account address`,
                });
              }

              const accountData = await connection.current.getParsedAccountInfo(
                pubKey,
              );
              if (!accountData || !accountData.value) {
                return this.createError({
                  message: `Account not found`,
                });
              }
              return true;
            } catch (e) {
              return this.createError({
                message: `Invalid account address`,
              });
            }
          } else {
            return this.createError({
              message: `Program id is required`,
            });
          }
        },
      ),
  });
  useEffect(() => {
    if (form.programId) {
      //now validation contains only programId if more fields come it would be good to reconsider this method.
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form);
        setFormErrors(validationErrors);
      });
    }
  }, [form.programId]);
  return (
    <div className="space-y-3">
      <PreviousRouteBtn />
      <div className="border-b border-fgd-4 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <h1>Create new program governance </h1>
        </div>
      </div>
      <Input
        label="Program id"
        value={form.programId}
        type="text"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'programId',
          })
        }
        error={formErrors['programId']}
      />
      <div className="text-sm mb-3">
        <div className="mb-2">Transfer upgrade authority to governance</div>
        <div className="flex flex-row text-xs items-center">
          <Switch
            checked={form.transferAuthority}
            onChange={(checked) =>
              handleSetForm({
                value: checked,
                propertyName: 'transferAuthority',
              })
            }
          />
        </div>
      </div>
      <BaseGovernanceForm
        formErrors={formErrors}
        form={form}
        setForm={setForm}
        setFormErrors={setFormErrors}
      ></BaseGovernanceForm>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Tooltip content={!connected && 'Please connect your wallet'}>
          <Button
            disabled={!connected || isLoading}
            isLoading={isLoading}
            onClick={handleCreate}
          >
            Create
          </Button>
        </Tooltip>
      </div>
    </div>
  );
};

export default NewProgramForm;
