/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import {
  SingleSideStakingClient,
  StakingCampaign,
} from '@uxdprotocol/uxd-staking-client'
import Input from '@components/inputs/Input'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { UXDStakingInitializeStakingCampaignForm } from '@utils/uiTypes/proposalCreationTypes'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import { BN } from '@project-serum/anchor'
import { getSplTokenInformationByUIName } from '@utils/splTokens'
import SelectSplToken from '../../SelectSplToken'
import { findATAAddrSync } from '@utils/ataTools'
import useWalletStore from 'stores/useWalletStore'

const InitializeStakingCampaign = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const wallet = useWalletStore((s) => s.current)

  const nowInSec = Math.floor(Date.now() / 1000)

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDStakingInitializeStakingCampaignForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      rewardMintUIName: yup.string().required('Reward Mint Name is required'),
      stakedMintUIName: yup.string().required('Staked Mint Name is required'),
      startTs: yup
        .number()
        .moreThan(nowInSec, `Start Timestamp should be more than ${nowInSec}`)
        .required('Start Timestamp is required'),
      endTs: yup
        .number()
        .moreThan(nowInSec, `End Timestamp should be more than ${nowInSec}`)
        .moreThan(yup.ref('startTs'), 'EndTs should be > StartTs'),
      uiRewardAmountToDeposit: yup
        .number()
        .moreThan(0, 'Reward Amount To Deposit should be more than 0')
        .required('Reward Amount to Deposit is required'),
    }),

    buildInstruction: async function () {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster]

      const campaignPDA =
        uxdProtocolStakingConfiguration.campaignPDA[connection.cluster]

      if (!programId || !campaignPDA) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`
        )
      }

      if (!wallet?.publicKey) {
        throw new Error('Wallet should be connected')
      }

      const client: SingleSideStakingClient = new SingleSideStakingClient(
        programId
      )

      const rewardSplToken = getSplTokenInformationByUIName(
        form.rewardMintUIName!
      )
      const stakedSplToken = getSplTokenInformationByUIName(
        form.stakedMintUIName!
      )

      const authority = governedAccount!.governance.pubkey

      const [rewardVaultPda] = findATAAddrSync(authority, rewardSplToken.mint)
      const [stakedVaultPda] = findATAAddrSync(authority, stakedSplToken.mint)

      const stakingCampaign = new StakingCampaign(
        campaignPDA,
        rewardSplToken.mint,
        rewardSplToken.decimals,
        rewardVaultPda,
        stakedSplToken.mint,
        stakedSplToken.decimals,
        stakedVaultPda,
        new BN(form.startTs!).mul(new BN(1000)),
        form.endTs ? new BN(form.endTs).mul(new BN(1000)) : undefined
      )

      console.log('Initialize Staking Campaign', {
        authority: authority.toString(),
        campaignPDA: campaignPDA.toString(),
        rewardSplTokenMint: rewardSplToken.mint.toString(),
        rewardSplTokenDecimals: rewardSplToken.decimals,
        rewardVaultPda: rewardVaultPda.toString(),
        stakedSplTokenMint: stakedSplToken.mint.toString(),
        stakedSplTokenDecimals: stakedSplToken.decimals,
        stakedVaultPda: stakedVaultPda.toString(),
        startTs: form.startTs,
        endTs: form.endTs,
        payer: wallet.publicKey.toString(),
      })

      return client.createInitializeStakingCampaignInstruction({
        authority,
        stakingCampaign,
        rewardDepositAmount: form.uiRewardAmountToDeposit!,
        options: uxdProtocolStakingConfiguration.TXN_OPTS,
        payer: wallet.publicKey,
      })
    },
  })

  return (
    <>
      <SelectSplToken
        label="Reward Token Name"
        selectedValue={form.rewardMintUIName}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'rewardMintUIName' })
        }
        error={formErrors['rewardMintUIName']}
      />

      <SelectSplToken
        label="Staked Token Name"
        selectedValue={form.stakedMintUIName}
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'stakedMintUIName' })
        }
        error={formErrors['stakedMintUIName']}
      />

      <Input
        label="Start Timestamp (in seconds, 10 digits)"
        value={form.startTs}
        type="number"
        min={Date.now()}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'startTs',
          })
        }
        error={formErrors['startTs']}
      />

      <Input
        label="End Timestamp (in seconds, 10 digits) - Optional"
        value={form.endTs}
        type="number"
        min={Date.now()}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'endTs',
          })
        }
        error={formErrors['endTs']}
      />

      <Input
        label="Reward Amount to Deposit"
        value={form.uiRewardAmountToDeposit}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRewardAmountToDeposit',
          })
        }
        error={formErrors['uiRewardAmountToDeposit']}
      />
    </>
  )
}

export default InitializeStakingCampaign
