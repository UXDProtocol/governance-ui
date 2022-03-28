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
import { UXDStakingActivateStakingOptionForm } from '@utils/uiTypes/proposalCreationTypes'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking/configuration'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import Switch from '@components/Switch'

const ActivateStakingOption = ({
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
  } = useInstructionFormBuilder<UXDStakingActivateStakingOptionForm>({
    index,
    initialFormValues: {
      governedAccount,
      activate: true,
    },
    schema: yup.object().shape({
      governedAccount: yup
        .object()
        .nullable()
        .required('Governed account is required'),
      stakingCampaignPda: yup
        .string()
        .required('Staking Campaign Pda is required'),
      activate: yup.boolean().required('Activate is required'),
      stakingOptionIdentifier: yup
        .number()
        .moreThan(0, 'Staking Option Identifier should be more than 0')
        .required('Staking Option Identifier is required'),
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

      const stakingCampaignState = await getOnchainStakingCampaign(
        new PublicKey(form.stakingCampaignPda!),
        connection.current,
        uxdProtocolStakingConfiguration.TXN_OPTS
      )

      const client: SingleSideStakingClient = new SingleSideStakingClient(
        programId
      )

      const authority = governedAccount!.governance.pubkey

      console.log('Activate Staking Option', {
        authority: authority.toString(),
        rewardMint: stakingCampaignState.rewardMint.toString(),
        rewardMintDecimals: stakingCampaignState.rewardMintDecimals,
        rewardVault: stakingCampaignState.rewardVault.toString(),
        stakedMint: stakingCampaignState.stakedMint.toString(),
        stakedMintDecimals: stakingCampaignState.stakedMintDecimals,
        stakedVault: stakingCampaignState.stakedVault.toString(),
        startTs: stakingCampaignState.startTs.toString(),
        endTs: stakingCampaignState.endTs?.toString(),
      })

      const stakingCampaign = new StakingCampaign(
        campaignPDA,
        stakingCampaignState.rewardMint,
        stakingCampaignState.rewardMintDecimals,
        stakingCampaignState.rewardVault,
        stakingCampaignState.stakedMint,
        stakingCampaignState.stakedMintDecimals,
        stakingCampaignState.stakedVault,
        stakingCampaignState.startTs,
        stakingCampaignState.endTs
      )

      return client.createActivateStakingOptionInstruction({
        authority,
        stakingCampaign,
        stakingOptionIdentifier: form.stakingOptionIdentifier!,
        activate: form.activate!,
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

      <div className="flex items-center">
        <div className="text-sm">Activate</div>

        <Switch
          className="ml-3"
          checked={form.activate ?? false}
          onChange={(checked) =>
            handleSetForm({
              value: checked,
              propertyName: 'activate',
            })
          }
        />
      </div>

      <Input
        label="Staking Option Identifier"
        value={form.stakingOptionIdentifier}
        type="number"
        min={0}
        onChange={(evt) =>
          handleSetForm({
            value: evt.target.value,
            propertyName: 'stakingOptionIdentifier',
          })
        }
        error={formErrors['stakingOptionIdentifier']}
      />
    </>
  )
}

export default ActivateStakingOption
