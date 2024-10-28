import NewProgramForm from '@components/AssetsList/NewProgramForm'
import Button from '@components/Button'
import React, { useEffect, useState } from 'react'

import useDelegators from '@components/VotePanel/useDelegators'
import { useVoteRecordsByOwnerQuery } from '@hooks/queries/voteRecord'
import { twMerge } from 'tailwind-merge'
import {
  TokenOwnerRecord,
  ProgramAccount,
  VoteRecord,
  RpcContext,
  getTokenOwnerRecordAddress,
} from '@solana/spl-governance'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { relinquishVote } from 'actions/relinquishVote'
import { fetchProposalByPubkeyQuery } from '@hooks/queries/proposal'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { getProgramVersionForRealm } from '@models/registry/api'
import useRealm from '@hooks/useRealm'
import { useRealmQuery } from '@hooks/queries/realm'
import { useVotingClientForGoverningTokenMint } from '@hooks/useVotingClients'
import { PublicKey } from '@solana/web3.js'
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@solana/governance-program-library'

// This helper allows you to relinquish existing votes
export default function Relinquish() {
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const connection = useLegacyConnectionContext()
  const { realmInfo } = useRealm()
  const realm = useRealmQuery().data?.result
  const votingClient = useVotingClientForGoverningTokenMint(
    new PublicKey('UXPhBoR3qG4UCiGNJfV7MqhHyFqKN68g45GoYvAeL2M')
  )

  const delegators = useDelegators('community')

  const [
    relinquishInProgress,
    setRelinquishInProgress,
  ] = useState<PublicKey | null>(null)

  const [
    selectedDelegator,
    setSelectedDelegator,
  ] = useState<ProgramAccount<TokenOwnerRecord> | null>(null)

  const voteRecords = useVoteRecordsByOwnerQuery(
    selectedDelegator !== null
      ? selectedDelegator.account.governingTokenOwner
      : undefined
  ).data

  const [unrelinquishedVotes, setUnrelinquisedVotes] = useState<
    ProgramAccount<VoteRecord>[] | null
  >(null)

  const [relinquishedVotes, setRelinquisedVotes] = useState<
    ProgramAccount<VoteRecord>[] | null
  >(null)

  useEffect(() => {
    if (!voteRecords) {
      setUnrelinquisedVotes(null)
      setRelinquisedVotes(null)
      return
    }

    setUnrelinquisedVotes(voteRecords.filter((x) => !x.account.isRelinquished))
    setRelinquisedVotes(voteRecords.filter((x) => x.account.isRelinquished))
  }, [voteRecords])

  if (!connected) return <h2 className="mt-8">Please connect...</h2>

  return (
    <div className="w-full h-full">
      <div className="flex flex-col">
        <h2>Detected Delegators</h2>

        <div className="flex flex-col border gap-4 p-2 border-gray-400">
          {typeof delegators !== 'undefined'
            ? delegators.length
              ? delegators.map((x) => (
                  <div
                    key={x.account.governingTokenOwner.toBase58()}
                    className={twMerge(
                      'flex gap-2 items-center cursor-pointer hover:opacity-100',
                      selectedDelegator !== null &&
                        selectedDelegator.pubkey.equals(x.pubkey)
                        ? 'opacity-100'
                        : 'opacity-80'
                    )}
                    onClick={() => {
                      setSelectedDelegator(x)
                    }}
                  >
                    <div
                      className={twMerge(
                        'h-4 w-4 border rounded-full',
                        selectedDelegator !== null &&
                          selectedDelegator.pubkey.equals(x.pubkey)
                          ? 'bg-white'
                          : ''
                      )}
                    ></div>
                    <div>{x.account.governingTokenOwner.toBase58()}</div>
                  </div>
                ))
              : 'None'
            : 'Loading...'}
        </div>
      </div>

      <div className="flex flex-col mt-4">
        <h2>Detected Unrelinquished Votes</h2>

        <div className="flex flex-col border gap-4 p-2 border-gray-400">
          {unrelinquishedVotes !== null
            ? unrelinquishedVotes.length
              ? unrelinquishedVotes.map((x) => (
                  <div
                    key={x.account.proposal.toBase58()}
                    className="flex gap-2 items-center"
                  >
                    <div>{x.account.proposal.toBase58()}</div>

                    <Button
                      isLoading={
                        relinquishInProgress &&
                        relinquishInProgress.equals(x.pubkey)
                          ? true
                          : false
                      }
                      disabled={relinquishInProgress !== null}
                      className="text-xs flex"
                      onClick={async () => {
                        if (!realm) {
                          console.error('Cannot find realm')
                          return
                        }

                        if (!selectedDelegator) {
                          console.error('Cannot find delegator')
                          return
                        }

                        if (!wallet.publicKey) {
                          console.error('Cannot find wallet pubkey')
                          return
                        }

                        if (!realmInfo) {
                          console.error('Cannot find realm info')
                          return
                        }

                        setRelinquishInProgress(x.pubkey)

                        // Load the proposal info
                        const proposal = (
                          await fetchProposalByPubkeyQuery(
                            connection.current,
                            x.account.proposal
                          )
                        ).result

                        if (!proposal) {
                          console.error(
                            'Cannot find proposal',
                            x.account.proposal.toBase58()
                          )
                          return
                        }

                        const rpcContext = new RpcContext(
                          new PublicKey(
                            'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
                          ),
                          realmInfo.programVersion,
                          wallet,
                          connection.current,
                          connection.endpoint
                        )

                        try {
                          await relinquishVote(
                            rpcContext,
                            realm.pubkey,
                            proposal,
                            selectedDelegator.pubkey, // Who have voted
                            x.pubkey, // The vote record
                            [],
                            votingClient
                          )

                          console.log('WORKED')

                          // Reload the page to force taking into account the change
                          window.location.reload()
                        } catch (e) {
                          console.log('ERROR', e)
                        }
                      }}
                    >
                      Relinquish
                    </Button>
                  </div>
                ))
              : 'None'
            : selectedDelegator === null
            ? 'Pick a delegator...'
            : 'Loading...'}
        </div>
      </div>

      <div className="flex flex-col mt-4">
        <h2>Detected Relinquished Votes</h2>

        <div className="flex flex-col border gap-4 p-2 border-gray-400">
          {relinquishedVotes !== null
            ? relinquishedVotes.length
              ? relinquishedVotes.map((x) => (
                  <div key={x.account.proposal.toBase58()}>
                    {x.account.proposal.toBase58()}
                  </div>
                ))
              : 'None'
            : selectedDelegator === null
            ? 'Pick a delegator...'
            : 'Loading...'}
        </div>
      </div>
    </div>
  )
}
