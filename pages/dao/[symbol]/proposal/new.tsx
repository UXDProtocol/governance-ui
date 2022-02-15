import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'

import useQueryContext from '@hooks/useQueryContext'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import Select from '@components/inputs/Select'
import React, { createContext, useEffect, useState } from 'react'
import Button, { LinkButton, SecondaryButton } from '@components/Button'
import SplTokenTransfer from './components/instructions/SplTokenTransfer'
import { RpcContext } from '@solana/spl-governance'
import { createProposal } from 'actions/createProposal'
import useWalletStore from 'stores/useWalletStore'
import { getInstructionDataFromBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { PlusCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { notify } from 'utils/notifications'
import * as yup from 'yup'
import { formValidation, isFormValid } from '@utils/formValidation'
import { useRouter } from 'next/router'
import {
  ComponentInstructionData,
  UiInstruction,
  Instructions,
  InstructionsContext,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { ProgramAccount } from '@solana/spl-governance'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import InstructionContentContainer from './components/InstructionContentContainer'
import ProgramUpgrade from './components/instructions/ProgramUpgrade'
import SetProgramAuthority from './components/instructions/SetProgramAuthority'
import Empty from './components/instructions/Empty'
import Mint from './components/instructions/Mint'
import CustomBase64 from './components/instructions/CustomBase64'
import { getTimestampFromDays } from '@tools/sdk/units'
import InitializeController from './components/instructions/UXD/InitializeController'
import SetRedeemGlobalSupplyCap from './components/instructions/UXD/SetRedeemGlobalSupplyCap'
import RegisterMangoDepository from './components/instructions/UXD/RegisterMangoDepository'
import SetMangoDepositoriesRedeemableSoftCap from './components/instructions/UXD/SetMangoDepositoriesRedeemableSoftCap'
import DepositInsuranceToMangoDepository from './components/instructions/UXD/DepositInsuranceToMangoDepository'
import WithdrawInsuranceFromMangoDepository from './components/instructions/UXD/WithdrawInsuranceFromMangoDepository'
import MakeChangeMaxAccounts from './components/instructions/Mango/MakeChangeMaxAccounts'
import VoteBySwitch from './components/VoteBySwitch'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { getProgramVersionForRealm } from '@models/registry/api'
import AddLiquidityRaydium from './components/instructions/raydium/AddLiquidity'
import { useVoteRegistry } from 'VoteStakeRegistry/hooks/useVoteRegistry'
import CreateObligationAccount from './components/instructions/solend/CreateObligationAccount'
import InitObligationAccount from './components/instructions/solend/InitObligationAccount'
import DepositReserveLiquidityAndObligationCollateral from './components/instructions/solend/DepositReserveLiquidityAndObligationCollateral'
import WithdrawObligationCollateralAndRedeemReserveLiquidity from './components/instructions/solend/WithdrawObligationCollateralAndRedeemReserveLiquidity'
import CreateAssociatedTokenAccount from './components/instructions/CreateAssociatedTokenAccount'
import RefreshObligation from './components/instructions/solend/RefreshObligation'
import RefreshReserve from './components/instructions/solend/RefreshReserve'
import Grant from 'VoteStakeRegistry/components/instructions/Grant'
import Clawback from 'VoteStakeRegistry/components/instructions/Clawback'
import RemoveLiquidityRaydium from './components/instructions/raydium/RemoveLiquidity'
import SaberTribecaNewEscrow from './components/instructions/saberTribeca/NewEscrow'
import SaberTribecaLock from './components/instructions/saberTribeca/Lock'
import SaberTribecaCreateEscrowSbrATA from './components/instructions/saberTribeca/CreateEscrowSbrATA'
import SaberTribecaCreateGaugeVoter from './components/instructions/saberTribeca/CreateGaugeVoter'
import SaberTribecaCreateGaugeVote from './components/instructions/saberTribeca/CreateGaugeVote'
import SaberTribecaSetGaugeVote from './components/instructions/saberTribeca/SetGaugeVote'
import SaberTribecaPrepareEpochGaugeVoter from './components/instructions/saberTribeca/PrepareEpochGaugeVoter'
import SaberTribecaCreateEpochGauge from './components/instructions/saberTribeca/CreateEpochGauge'
import SaberTribecaGaugeCommitVote from './components/instructions/saberTribeca/GaugeCommitVote'

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
})
const defaultGovernanceCtx: InstructionsContext = {
  instructionsData: [],
  handleSetInstructions: () => null,
  governance: null,
  setGovernance: () => null,
}
export const NewProposalContext = createContext<InstructionsContext>(
  defaultGovernanceCtx
)

// Takes the first encountered governance account
function extractGovernanceAccountFromInstructionsData(
  instructionsData: ComponentInstructionData[]
): ProgramAccount<Governance> | null {
  return instructionsData.reduce((tmp, x) => {
    if (tmp) {
      return tmp
    }

    if (x.governedAccount) {
      return x.governedAccount
    }

    return tmp
  }, null)
}

const New = () => {
  const router = useRouter()
  const { client } = useVoteRegistry()
  const { fmtUrlWithCluster } = useQueryContext()
  const {
    symbol,
    realm,
    realmInfo,
    realmDisplayName,
    ownVoterWeight,
    mint,
    councilMint,
    canChooseWhoVote,
  } = useRealm()

  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernances,
  } = useWalletStore((s) => s.actions)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [
    governance,
    setGovernance,
  ] = useState<ProgramAccount<Governance> | null>(null)
  const [isLoadingSignedProposal, setIsLoadingSignedProposal] = useState(false)
  const [isLoadingDraft, setIsLoadingDraft] = useState(false)
  const isLoading = isLoadingSignedProposal || isLoadingDraft
  const customInstructionFilterForSelectedGovernance = (
    instructionType: Instructions
  ) => {
    if (!governance) {
      return true
    } else {
      const governanceType = governance.account.accountType
      const instructionsAvailiableAfterProgramGovernance = [Instructions.Base64]
      switch (governanceType) {
        case GovernanceAccountType.ProgramGovernanceV1:
        case GovernanceAccountType.ProgramGovernanceV2:
          return instructionsAvailiableAfterProgramGovernance.includes(
            instructionType
          )
        default:
          return true
      }
    }
  }

  const getAvailableInstructionsForIndex = (index) => {
    if (index === 0) {
      return availableInstructions
    } else {
      return availableInstructions.filter((x) =>
        customInstructionFilterForSelectedGovernance(x.id)
      )
    }
  }
  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]
    newInstructions[index] = { ...instructionsData[index], ...val }
    setInstructions(newInstructions)
  }
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setInstructionType = ({ value, idx }) => {
    const newInstruction = {
      type: value,
    }
    handleSetInstructions(newInstruction, idx)
  }
  const addInstruction = () => {
    setInstructions([...instructionsData, { type: undefined }])
  }
  const removeInstruction = (idx) => {
    setInstructions([...instructionsData.filter((x, index) => index !== idx)])
  }
  const handleGetInstructions = async () => {
    const instructions: UiInstruction[] = []
    for (const inst of instructionsData) {
      if (inst.getInstruction) {
        const instruction: UiInstruction = await inst?.getInstruction()
        instructions.push(instruction)
      }
    }
    return instructions
  }
  const handleTurnOffLoaders = () => {
    setIsLoadingSignedProposal(false)
    setIsLoadingDraft(false)
  }
  const handleCreate = async (isDraft) => {
    setFormErrors({})
    if (isDraft) {
      setIsLoadingDraft(true)
    } else {
      setIsLoadingSignedProposal(true)
    }

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    const instructions: UiInstruction[] = await handleGetInstructions()
    let proposalAddress: PublicKey | null = null
    if (!realm) {
      handleTurnOffLoaders()
      throw 'No realm selected'
    }

    if (isValid && instructions.every((x: UiInstruction) => x.isValid)) {
      let selectedGovernance = governance
      if (!governance) {
        handleTurnOffLoaders()
        throw Error('No governance selected')
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )
      const instructionsData = instructions.map((x) => {
        return {
          data: x.serializedInstruction
            ? getInstructionDataFromBase64(x.serializedInstruction)
            : null,
          holdUpTime: x.customHoldUpTime
            ? getTimestampFromDays(x.customHoldUpTime)
            : selectedGovernance?.account?.config.minInstructionHoldUpTime,
          prerequisiteInstructions: x.prerequisiteInstructions || [],
          chunkSplitByDefault: x.chunkSplitByDefault || false,
        }
      })

      try {
        // Fetch governance to get up to date proposalCount
        selectedGovernance = (await fetchRealmGovernance(
          governance.pubkey
        )) as ProgramAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance.account.config
        )
        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm.account.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.account.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }

        proposalAddress = await createProposal(
          rpcContext,
          realm,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title,
          form.description,
          proposalMint,
          selectedGovernance?.account?.proposalCount,
          instructionsData,
          isDraft,
          client
        )

        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )

        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    } else {
      setFormErrors(validationErrors)
    }
    handleTurnOffLoaders()
  }
  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.pubkey])

  useEffect(() => {
    const governedAccount = extractGovernanceAccountFromInstructionsData(
      instructionsData
    )

    setGovernance(governedAccount)
  }, [instructionsData])

  useEffect(() => {
    //fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  const components: {
    [key in Instructions]: (props: {
      index: number
      governance: ProgramAccount<Governance> | null
    }) => JSX.Element
  } = {
    [Instructions.Transfer]: SplTokenTransfer,
    [Instructions.ProgramUpgrade]: ProgramUpgrade,
    [Instructions.SetProgramAuthority]: SetProgramAuthority,
    [Instructions.CreateAssociatedTokenAccount]: CreateAssociatedTokenAccount,
    [Instructions.CreateSolendObligationAccount]: CreateObligationAccount,
    [Instructions.InitSolendObligationAccount]: InitObligationAccount,
    [Instructions.DepositReserveLiquidityAndObligationCollateral]: DepositReserveLiquidityAndObligationCollateral,
    [Instructions.RefreshSolendObligation]: RefreshObligation,
    [Instructions.RefreshSolendReserve]: RefreshReserve,
    [Instructions.WithdrawObligationCollateralAndRedeemReserveLiquidity]: WithdrawObligationCollateralAndRedeemReserveLiquidity,
    [Instructions.SaberTribecaNewEscrow]: SaberTribecaNewEscrow,
    [Instructions.SaberTribecaLock]: SaberTribecaLock,
    [Instructions.SaberTribecaCreateEscrowSbrATA]: SaberTribecaCreateEscrowSbrATA,
    [Instructions.SaberTribecaCreateGaugeVoter]: SaberTribecaCreateGaugeVoter,
    [Instructions.SaberTribecaCreateGaugeVote]: SaberTribecaCreateGaugeVote,
    [Instructions.SaberTribecaGaugeSetVote]: SaberTribecaSetGaugeVote,
    [Instructions.SaberTribecaPrepareEpochGaugeVoter]: SaberTribecaPrepareEpochGaugeVoter,
    [Instructions.SaberTribecaCreateEpochGauge]: SaberTribecaCreateEpochGauge,
    [Instructions.SaberTribecaGaugeCommitVote]: SaberTribecaGaugeCommitVote,
    [Instructions.AddLiquidityRaydium]: AddLiquidityRaydium,
    [Instructions.RemoveLiquidityRaydium]: RemoveLiquidityRaydium,
    [Instructions.InitializeController]: InitializeController,
    [Instructions.SetRedeemableGlobalSupplyCap]: SetRedeemGlobalSupplyCap,
    [Instructions.SetMangoDepositoriesRedeemableSoftCap]: SetMangoDepositoriesRedeemableSoftCap,
    [Instructions.RegisterMangoDepository]: RegisterMangoDepository,
    [Instructions.DepositInsuranceToMangoDepository]: DepositInsuranceToMangoDepository,
    [Instructions.WithdrawInsuranceFromMangoDepository]: WithdrawInsuranceFromMangoDepository,
    [Instructions.Mint]: Mint,
    [Instructions.Base64]: CustomBase64,
    [Instructions.None]: Empty,
    [Instructions.MangoMakeChangeMaxAccounts]: MakeChangeMaxAccounts,
    [Instructions.Grant]: Grant,
    [Instructions.Clawback]: Clawback,
  } as const

  const getCurrentInstruction = ({ typeId, idx }) => {
    const component = components[typeId]

    if (!component) return null

    return component({
      index: idx,
      governance,
    })
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
          isLoading ? 'pointer-events-none' : ''
        }`}
      >
        <>
          <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
            <a className="flex items-center text-fgd-3 text-sm transition-all hover:text-fgd-1">
              <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
              Back
            </a>
          </Link>
          <div className="border-b border-fgd-4 pb-4 pt-2">
            <div className="flex items-center justify-between">
              <h1>
                Add a proposal
                {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
              </h1>
            </div>
          </div>
          <div className="pt-2">
            <div className="pb-4">
              <Input
                label="Title"
                placeholder="Title of your proposal"
                value={form.title}
                type="text"
                error={formErrors['title']}
                onChange={(evt) =>
                  handleSetForm({
                    value: evt.target.value,
                    propertyName: 'title',
                  })
                }
              />
            </div>
            <Textarea
              className="mb-3"
              label="Description"
              placeholder="Description of your proposal or use a github gist link (optional)"
              value={form.description}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'description',
                })
              }
            ></Textarea>
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              ></VoteBySwitch>
            )}
            <NewProposalContext.Provider
              value={{
                instructionsData,
                handleSetInstructions,
                governance,
                setGovernance,
              }}
            >
              <h2>Instructions</h2>

              {instructionsData.map((instruction, idx) => {
                const availableInstructionsForIdx = getAvailableInstructionsForIndex(
                  idx
                )
                return (
                  <div
                    key={idx}
                    className="mb-3 border border-fgd-4 p-4 md:p-6 rounded-lg"
                  >
                    <Select
                      className="h-12"
                      disabled={!getAvailableInstructionsForIndex.length}
                      placeholder={`${
                        availableInstructionsForIdx.length
                          ? 'Select instruction'
                          : 'No available instructions'
                      }`}
                      label={`Instruction ${idx + 1}`}
                      onChange={(value) => setInstructionType({ value, idx })}
                      value={instruction.type?.name}
                    >
                      {availableInstructionsForIdx.map((inst) => (
                        <Select.Option key={inst.id} value={inst}>
                          <span>{inst.name}</span>
                        </Select.Option>
                      ))}
                    </Select>
                    <div className="flex items-end pt-4">
                      <InstructionContentContainer
                        idx={idx}
                        instructionsData={instructionsData}
                      >
                        {getCurrentInstruction({
                          typeId: instruction.type?.id,
                          idx,
                        })}
                      </InstructionContentContainer>
                      {idx !== 0 && (
                        <LinkButton
                          className="flex font-bold items-center ml-4 text-fgd-1 text-sm"
                          onClick={() => removeInstruction(idx)}
                        >
                          <XCircleIcon className="h-5 mr-1.5 text-red w-5" />
                          Remove
                        </LinkButton>
                      )}
                    </div>
                  </div>
                )
              })}
            </NewProposalContext.Provider>
            <div className="flex justify-end mt-4 mb-8 px-6">
              <LinkButton
                className="flex font-bold items-center text-fgd-1 text-sm"
                onClick={addInstruction}
              >
                <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
                Add instruction
              </LinkButton>
            </div>
            <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
              <SecondaryButton
                disabled={isLoading}
                isLoading={isLoadingDraft}
                onClick={() => handleCreate(true)}
              >
                Save draft
              </SecondaryButton>
              <Button
                isLoading={isLoadingSignedProposal}
                disabled={isLoading}
                onClick={() => handleCreate(false)}
              >
                Add proposal
              </Button>
            </div>
          </div>
        </>
      </div>
      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <TokenBalanceCardWrapper />
      </div>
    </div>
  )
}

export default New
