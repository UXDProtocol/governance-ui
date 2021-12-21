import {
  PublicKey,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { GOVERNANCE_SCHEMA } from './serialisation'
import { serialize } from 'borsh'
import { CancelProposalArgs } from './instructions'
import { ProgramVersion } from './registry/constants'
// import { InstructionData } from './accounts'

export const withCancelProposal = (
  instructions: TransactionInstruction[],
  programId: PublicKey,
  programVersion: number,
  proposal: PublicKey,
  proposalOwnerRecord: PublicKey,
  governanceAuthority: PublicKey,
  governance: PublicKey
) => {
  const args = new CancelProposalArgs()
  const data = Buffer.from(serialize(GOVERNANCE_SCHEMA, args))

  const keys = [
    {
      pubkey: proposal,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: proposalOwnerRecord,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: governanceAuthority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ]

  if (programVersion > ProgramVersion.V1) {
    keys.push({
      pubkey: governance,
      isWritable: false,
      isSigner: false,
    })
  }

  instructions.push(
    new TransactionInstruction({
      keys,
      programId,
      data,
    })
  )
}
