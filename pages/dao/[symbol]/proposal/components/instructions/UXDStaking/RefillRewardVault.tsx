/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from 'react'
import * as yup from 'yup'
import {
  getOnchainStakingCampaign,
  SingleSideStakingClient,
  StakingCampaign,
} from '@uxdprotocol/uxd-staking-client'
import Input from '@components/inputs/Input'
import useInstructionFormBuilder from '@hooks/useInstructionFormBuilder'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { UXDStakingRefillRewardVaultForm } from '@utils/uiTypes/proposalCreationTypes'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'

const RefillRewardVault = ({
  index,
  governedAccount,
}: {
  index: number
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const wallet = useWalletStore((s) => s.current)

  const {
    form,
    connection,
    formErrors,
    handleSetForm,
  } = useInstructionFormBuilder<UXDStakingRefillRewardVaultForm>({
    index,
    initialFormValues: {
      governedAccount,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      stakingCampaignPda: yup
        .string()
        .required('Staking Campaign Pda is required'),
      uiRewardRefillAmount: yup
        .number()
        .moreThan(0, 'Reward Refill Amount should be more than 0')
        .required('Reward Amount is required'),
    }),

    buildInstruction: async function () {
      const programId =
        uxdProtocolStakingConfiguration.programId[connection.cluster]

      if (!programId) {
        throw new Error(
          `Unsupported cluster ${connection.cluster} for UXD Protocol Staking`
        )
      }

      if (!wallet?.publicKey) {
        throw new Error('Wallet should be connected')
      }

      const stakingCampaignPda = new PublicKey(form.stakingCampaignPda!)

      const stakingCampaignState = await getOnchainStakingCampaign(
        stakingCampaignPda,
        connection.current,
        uxdProtocolStakingConfiguration.TXN_OPTS
      )

      const client: SingleSideStakingClient = new SingleSideStakingClient(
        programId
      )

      const authority = governedAccount!.governance.pubkey

      console.log('Refill Reward Vault Staking Campaign', {
        stakingCampaignPda: stakingCampaignPda.toString(),
        authority: authority.toString(),
        rewardMint: stakingCampaignState.rewardMint.toString(),
        rewardMintDecimals: stakingCampaignState.rewardMintDecimals,
        rewardVault: stakingCampaignState.rewardVault.toString(),
        stakedMint: stakingCampaignState.stakedMint.toString(),
        stakedMintDecimals: stakingCampaignState.stakedMintDecimals,
        stakedVault: stakingCampaignState.stakedVault.toString(),
        startTs: stakingCampaignState.startTs.toString(),
        endTs: stakingCampaignState.endTs?.toString(),
        initialRewardAmount: stakingCampaignState.initialRewardAmount.toString(),
      })

      const stakingCampaign = StakingCampaign.fromState(
        stakingCampaignPda,
        stakingCampaignState
      )

      return client.createRefillRewardVaultInstruction({
        authority,
        stakingCampaign,
        rewardRefillAmount: form.uiRewardRefillAmount!,
        options: uxdProtocolStakingConfiguration.TXN_OPTS,
        payer: wallet.publicKey,
      })
    },
  })

  return (
    <>
      <Input
        label="Staking Campaign Pda"
        value={form.stakingCampaignPda}
        type="string"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'stakingCampaignPda',
          })
        }
        error={formErrors['stakingCampaignPda']}
      />

      <Input
        label="Reward Refill Amount"
        value={form.uiRewardRefillAmount}
        type="number"
        min="0"
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'uiRewardRefillAmount',
          })
        }
        error={formErrors['uiRewardRefillAmount']}
      />
    </>
  )
}

export default RefillRewardVault
