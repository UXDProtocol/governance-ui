import { PublicKey } from '@solana/web3.js'
import { useState, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useProposal from './useProposal'

const useProposalSignature = () => {
  const { proposal, instructions } = useProposal()
  const connection = useWalletStore((s) => s.connection)
  const [proposalSignature, setProposalSignature] = useState('')
  const [itx] = Object.keys(instructions)
  useEffect(() => {
    async function getSignature() {
      if (!proposal?.account.executingAt || !itx) return
      const [
        { signature },
      ] = await connection.current.getConfirmedSignaturesForAddress2(
        new PublicKey(itx),
        { limit: 1 },
        'finalized'
      )
      setProposalSignature(signature)
    }
    getSignature().catch((e) => console.error(e))
  }, [proposal?.account.executingAt, connection, itx])

  return { proposalSignature }
}

export default useProposalSignature
