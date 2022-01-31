import { Proposal, ProposalInstruction } from '@solana/spl-governance'

import { withExecuteInstruction } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { sendSignedTransaction, signTransaction } from '@utils/send'

import { Keypair, Transaction, TransactionInstruction } from '@solana/web3.js'

const DEFAULT_TIMEOUT = 31000

export const executeInstructions = async (
  { connection, wallet, programId }: RpcContext,
  proposal: ProgramAccount<Proposal>,
  proposalInstructions: ProgramAccount<ProposalInstruction>[]
) => {
  const signers: Keypair[] = []
  const instructions: TransactionInstruction[] = []

  // Merge proposal instructions altogether
  // -- withExecuteInstruction mutate given 'instructions' parameter
  await Promise.all(
    proposalInstructions.map((instruction) =>
      withExecuteInstruction(
        instructions,
        programId,
        proposal.account.governance,
        proposal.pubkey,
        instruction.pubkey,
        instruction.account.instruction
      )
    )
  )

  const transaction = new Transaction()

  transaction.add(...instructions)

  // Prepare transactions
  const signedTransaction = await signTransaction({
    transaction,
    wallet,
    signers,
    connection,
  })

  await sendSignedTransaction({
    signedTransaction,
    connection,
    sendingMessage: 'Executing instruction',
    successMessage: 'Execution finalized',
    timeout: DEFAULT_TIMEOUT,
  })
}
