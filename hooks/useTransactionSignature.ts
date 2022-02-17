import { PublicKey } from '@solana/web3.js'
import { useState, useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'

const useTransactionSignature = (address?: PublicKey) => {
  const connection = useWalletStore((s) => s.connection)
  const [transactionSignature, setTransactionSignature] = useState('')
  useEffect(() => {
    async function getSignature() {
      if (!address) return
      const [
        transaction,
      ] = await connection.current.getConfirmedSignaturesForAddress2(
        address,
        { limit: 1 },
        'finalized'
      )
      if (!transaction?.signature) return
      setTransactionSignature(transaction.signature)
    }
    getSignature().catch((e) => console.warn(e.message))
  }, [connection, address])

  return { transactionSignature }
}

export default useTransactionSignature
