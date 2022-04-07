import Select from '@components/inputs/Select';
import { Governance, GovernanceAccountType } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
  GovernedMultiTypeAccount,
} from '@utils/tokens';
import React, { useEffect } from 'react';
import { getProgramName } from '@components/instructions/programs/names';
import { ChipIcon } from '@heroicons/react/solid';
import { CogIcon, CurrencyDollarIcon } from '@heroicons/react/outline';

const GovernedAccountSelect = ({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
  noMaxWidth,
}: {
  onChange: (selected: GovernedMultiTypeAccount) => void;
  value?: GovernedMultiTypeAccount;
  error?: string;
  governedAccounts: GovernedMultiTypeAccount[];
  shouldBeGoverned?: boolean;
  governance?: ProgramAccount<Governance> | null | undefined;
  label?: string;
  noMaxWidth?: boolean;
}) => {
  // TODO refactor both methods (getMintAccountLabelComponent, getTokenAccountLabelComponent) make it more common
  function getMintAccountLabelComponent({
    account,
    tokenName,
    mintAccountName,
    amount,
    imgUrl,
  }) {
    return (
      <div className="flex items-center">
        <div className="flex">
          <CogIcon className="w-8 h-8" />
        </div>

        <div className="mt-1 ml-2 flex flex-col">
          <span className="mb-0.5">{mintAccountName}</span>

          <div className="space-y-0.5 text-xs text-fgd-3 flex flex-col">
            {account && <span className="mb-0.5">{account}</span>}

            {tokenName && (
              <div className="flex items-center">
                Token: <img className="flex-shrink-0 h-4 w-4" src={imgUrl} />
                {tokenName}
              </div>
            )}
            <span>Supply: {amount}</span>
          </div>
        </div>
      </div>
    );
  }

  function getTokenAccountLabelComponent({
    tokenAccount,
    tokenAccountName,
    tokenName,
    amount,
  }) {
    return (
      <div className="flex items-center">
        <div className="flex">
          <CurrencyDollarIcon className="w-8 h-8" />
        </div>

        <div className="mt-1 ml-2 flex flex-col">
          {tokenAccountName && <div className="mb-0.5">{tokenAccountName}</div>}

          <div className="mb-0.5 text-fgd-3 text-xs">{tokenAccount}</div>

          <div className="flex space-x-3 text-xs text-fgd-3">
            {tokenName && (
              <div className="flex items-center">
                Token:
                <span className="ml-1 text-fgd-1">{tokenName}</span>
              </div>
            )}
            <div>
              Bal:<span className="ml-1 text-fgd-1">{amount}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function getProgramAccountLabel(val: ProgramAccount<Governance>) {
    const name = val
      ? getProgramName(val.account.governedAccount)
      : 'Unknown Program';

    return (
      <div className="flex items-center">
        <div className="flex">
          <ChipIcon className="w-8 h-8" />
        </div>

        <div className="mt-1 ml-2 flex flex-col">
          <span className="">{name}</span>

          <span className="text-fgd-3 text-xs">
            {val?.account?.governedAccount?.toBase58()}
          </span>
        </div>
      </div>
    );
  }

  function getLabel(value?: GovernedMultiTypeAccount) {
    if (!value) {
      return null;
    }

    const accountType = value.governance.account.accountType;

    switch (accountType) {
      case GovernanceAccountType.MintGovernanceV1:
      case GovernanceAccountType.MintGovernanceV2:
        return getMintAccountLabelComponent(getMintAccountLabelInfo(value));
      case GovernanceAccountType.TokenGovernanceV1:
      case GovernanceAccountType.TokenGovernanceV2:
        return getTokenAccountLabelComponent(
          value.isSol
            ? getSolAccountLabel(value)
            : getTokenAccountLabelInfo(value),
        );
      case GovernanceAccountType.ProgramGovernanceV1:
      case GovernanceAccountType.ProgramGovernanceV2:
        return getProgramAccountLabel(value.governance);
      default:
        return value.governance.account.governedAccount.toBase58();
    }
  }

  useEffect(() => {
    if (governedAccounts.length == 1) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governedAccounts[0]);
      });
    }
  }, [JSON.stringify(governedAccounts)]);

  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value)}
      placeholder="Please select..."
      value={value?.governance?.account.governedAccount.toBase58()}
      error={error}
      noMaxWidth={noMaxWidth}
    >
      {governedAccounts
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x?.governance?.pubkey.toBase58() ===
              governance?.pubkey?.toBase58(),
        )
        .map((acc) => {
          return (
            <Select.Option
              key={acc.governance?.account.governedAccount.toBase58()}
              value={acc}
            >
              {getLabel(acc)}
            </Select.Option>
          );
        })}
    </Select>
  );
};

export default GovernedAccountSelect;
