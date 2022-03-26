import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { createContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import Button, { SecondaryButton } from '@components/Button'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useCreateProposal from '@hooks/useCreateProposal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import { getTimestampFromDays } from '@tools/sdk/units'
import { formValidation, isFormValid } from '@utils/formValidation'
import {
  ComponentInstructionData,
  InstructionsContext,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'
import { notify } from 'utils/notifications'

import VoteBySwitch from './components/VoteBySwitch'
import InstructionsForm from './components/InstructionsForm'

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

const New = () => {
  const router = useRouter()
  const { handleCreateProposal } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realm, realmDisplayName, canChooseWhoVote } = useRealm()
  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const {
    fetchRealmGovernance,
    fetchTokenAccountsForSelectedRealmGovernance,
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

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])

  const handleSetForm = ({
    propertyName,
    value,
  }: {
    propertyName: keyof typeof form
    value: unknown
  }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const getUiInstructions = async () => {
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

  const handleCreate = async (isDraft: boolean) => {
    setFormErrors({})

    if (!realm) {
      handleTurnOffLoaders()
      throw 'No realm selected'
    }

    if (isDraft) {
      setIsLoadingDraft(true)
    } else {
      setIsLoadingSignedProposal(true)
    }

    const { isValid, validationErrors }: formValidation = await isFormValid(
      schema,
      form
    )

    const instructions: UiInstruction[] = await getUiInstructions()

    if (!isValid || instructions.some((x: UiInstruction) => !x.isValid)) {
      setFormErrors(validationErrors)
      handleTurnOffLoaders()
      return
    }

    if (!governance) {
      handleTurnOffLoaders()
      throw Error('No governance selected')
    }

    try {
      // Fetch governance to get up to date proposalCount
      const selectedGovernance = (await fetchRealmGovernance(
        governance.pubkey
      )) as ProgramAccount<Governance>

      const proposalAddress = await handleCreateProposal({
        title: form.title,
        description: form.description,
        governance: selectedGovernance,
        voteByCouncil,
        isDraft,

        instructionsData: instructions.map((x) => {
          return {
            data: x.serializedInstruction
              ? getInstructionDataFromBase64(x.serializedInstruction)
              : null,
            holdUpTime: x.customHoldUpTime
              ? getTimestampFromDays(x.customHoldUpTime)
              : selectedGovernance?.account?.config.minInstructionHoldUpTime,
            prerequisiteInstructions: x.prerequisiteInstructions || [],
            chunkSplitByDefault: x.chunkSplitByDefault || false,
            signers: x.signers,
            shouldSplitIntoSeparateTxs: x.shouldSplitIntoSeparateTxs,
          }
        }),
      })

      const url = fmtUrlWithCluster(
        `/dao/${symbol}/proposal/${proposalAddress}`
      )

      router.push(url)
    } catch (ex) {
      notify({ type: 'error', message: `${ex}` })
    }
  }

  useEffect(() => {
    if (!fetchTokenAccountsForSelectedRealmGovernance) return

    // fetch to be up to date with amounts
    fetchTokenAccountsForSelectedRealmGovernance()
  }, [])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div
        className={`bg-bkg-2 col-span-12 md:col-span-7 md:order-first lg:col-span-8 order-last p-4 md:p-6 rounded-lg space-y-3 ${
          isLoading ? 'pointer-events-none' : ''
        }`}
      >
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

          <InstructionsForm
            availableInstructions={availableInstructions}
            onGovernanceChange={(
              governance: ProgramAccount<Governance> | null
            ) => {
              setGovernance(governance)
            }}
            onInstructionsDataChange={(
              instructionsData: ComponentInstructionData[]
            ) => {
              console.log('setInstructions >>>>', instructionsData)
              setInstructions(instructionsData)
            }}
          />

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
      </div>

      <div className="col-span-12 md:col-span-5 lg:col-span-4">
        <TokenBalanceCardWrapper />
      </div>
    </div>
  )
}

export default New
