import { useState, useContext, useEffect } from 'react'
import * as yup from 'yup'
import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import uxdProtocolStakingConfiguration from '@tools/sdk/uxdProtocolStaking'
import { isFormValid } from '@utils/formValidation'
import {
  UXDInitializeStakingCampaignForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../../new'
import { getSplTokenInformationByUIName } from '@utils/splTokens'
import useRealm from '@hooks/useRealm'
import GovernedAccountSelect from '../../GovernedAccountSelect'
import useSingleSideStakingClient from '@hooks/useSingleSideStakingClient'
import Input from '@components/inputs/Input'
import SelectSplToken from '../../SelectSplToken'

const nowInSec = Math.floor(Date.now() / 1000)

const schema = yup.object().shape({
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
})

const CLUSTER = 'mainnet'

const InitializeStakingCampaign = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useConnection()
  const wallet = useWalletOnePointOh()
  const shouldBeGoverned = !!(index !== 0 && governance)
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)
  const { assetAccounts } = useGovernanceAssets()
  const { realmInfo } = useRealm()
  const { client: sssClient } = useSingleSideStakingClient()

  const [form, setForm] = useState<UXDInitializeStakingCampaignForm>({
    governedAccount: undefined,
  })

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !wallet?.publicKey ||
      !form.governedAccount?.governance?.account.governedAccount
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const programId = uxdProtocolStakingConfiguration.programId[CLUSTER]
    if (!realmInfo) {
      throw new Error('Realm info not loaded')
    }
    if (!programId) {
      throw new Error(`Unsupported cluster ${CLUSTER} for UXD Protocol Staking`)
    }
    if (!sssClient) {
      throw new Error('Single side staking client not loaded')
    }

    const rewardSplToken = getSplTokenInformationByUIName(
      form.rewardMintUIName!
    )
    const stakedSplToken = getSplTokenInformationByUIName(
      form.stakedMintUIName!
    )
    const authority = form.governedAccount.governance.pubkey

    const ix = await sssClient.createInitializeStakingCampaignInstruction({
      authority,
      rewardMintDecimals: rewardSplToken.decimals,
      rewardMint: rewardSplToken.mint,
      stakedMint: stakedSplToken.mint,
      governanceProgram: realmInfo.programId,
      governanceRealm: realmInfo.realmId,
      startTs: form.startTs!,
      endTs: form.endTs,
      uiRewardDepositAmount: form.uiRewardAmountToDeposit!,
      options: uxdProtocolStakingConfiguration.TXN_OPTS,
      payer: wallet!.publicKey!,
    })

    return {
      serializedInstruction: serializeInstructionToBase64(ix),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form])

  return (
    <>
      <GovernedAccountSelect
        label="Governed account"
        governedAccounts={assetAccounts}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      />

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

      {form.startTs ? (
        <span>{new Date(form.startTs * 1000).toUTCString()}</span>
      ) : null}

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

      {form.endTs ? (
        <span>{new Date(form.endTs * 1000).toUTCString()}</span>
      ) : null}

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
