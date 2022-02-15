import { useState, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useProposal from './useProposal'

const useProposalSignature = () => {
  const { proposal } = useProposal()
  const connection = useWalletStore((s) => s.connection)
  const [proposalSignature, setProposalSignature] = useState('')

  useEffect(() => {
    async function getSignature() {
      if (!proposal?.pubkey || !proposal.account.executingAt) return
      const [
        { signature },
      ] = await connection.current.getConfirmedSignaturesForAddress2(
        proposal?.pubkey,
        { limit: 1 },
        'finalized'
      )
      setProposalSignature(signature)
    }
    getSignature()
  }, [proposal?.pubkey, proposal?.account.executingAt, connection])

  return { proposalSignature }
}

export default useProposalSignature
