import { findHoldingPDA, findVestingPDA } from '@soceanfi/bonding'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { BondingProgram } from './programs'
import soceanConfiguration from './configuration'
import { EndpointTypes } from '@models/types'
import { BN } from '@blockworks-foundation/mango-client'

const INDEX_MAGIC_NUMBER = 0

export async function vest({
  cluster,
  program,
  authority,
  bondPool,
  bondedMint,
  userBondedAccount,
  amount,
}: {
  cluster: EndpointTypes
  program: BondingProgram
  authority: PublicKey
  bondPool: PublicKey
  bondedMint: PublicKey
  userBondedAccount: PublicKey
  amount: BN
}): Promise<TransactionInstruction> {
  const bondingProgramId = soceanConfiguration.bondingProgramId[cluster]

  if (!bondingProgramId) {
    throw new Error(
      'unsupported cluster to create mintBondedTokens instruction'
    )
  }

  const [vesting, vestingBump] = await findVestingPDA(
    bondingProgramId,
    bondPool,
    authority,
    INDEX_MAGIC_NUMBER
  )
  const [holding, holdingBump] = await findHoldingPDA(bondingProgramId, vesting)

  console.log('vest', {
    user: authority.toString(),
    userBondedAccount: userBondedAccount.toString(),
    vesting: vesting.toString(),
    holding: holding.toString(),
    bondedMint: bondedMint.toString(),
    bondPool: bondPool.toString(),
    tokenProgram: TOKEN_PROGRAM_ID.toString(),
    systemProgram: SystemProgram.programId.toString(),
    rent: SYSVAR_RENT_PUBKEY.toString(),
    INDEX_MAGIC_NUMBER,
    vestingBump,
    holdingBump,
    amount: amount.toString(),
  })

  return program.instruction.vest(
    INDEX_MAGIC_NUMBER,
    vestingBump,
    holdingBump,
    amount,
    {
      accounts: {
        user: authority,
        userBondedAccount,
        vesting,
        holding,
        bondedMint,
        bondPool,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  )
}
