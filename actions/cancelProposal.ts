import { Account, Transaction, TransactionInstruction } from '@solana/web3.js'

import { RpcContext } from '../models/core/api'
import { Proposal } from '@models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { sendTransaction } from 'utils/send'
import { withCancelProposal } from '@models/withCancelProposal'

export const cancelProposal = async (
  { connection, wallet, programId, programVersion, walletPubkey }: RpcContext,
  proposal: ParsedAccount<Proposal>
) => {
  const instructions: TransactionInstruction[] = []
  const signers: Account[] = []
  const governanceAuthority = walletPubkey

  withCancelProposal(
    instructions,
    programId,
    programVersion,
    proposal!.pubkey,
    proposal!.info.tokenOwnerRecord,
    governanceAuthority,
    proposal.info.governance
  )

  const transaction = new Transaction({ feePayer: walletPubkey })

  transaction.add(...instructions)

  await sendTransaction({
    transaction,
    wallet,
    connection,
    signers,
    sendingMessage: 'Cancelling proposal',
    successMessage: 'Proposal cancelled',
  })
}
