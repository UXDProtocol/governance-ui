import { BN } from '@project-serum/anchor'
import {
  createBondMintAuthorityPDA,
  createVaultPda,
  findBondMintAuthorityPDA,
  findVaultPDA,
} from '@soceanfi/bonding'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { BondingProgram } from './programs'
import soceanConfiguration from './configuration'
import { EndpointTypes } from '@models/types'

export async function mintBondedTokens({
  cluster,
  program,
  amount,
  depositFrom,
  authority,
  bondPool,
  bondedMint,
  mintTo,
}: {
  cluster: EndpointTypes
  program: BondingProgram
  amount: BN
  depositFrom: PublicKey
  authority: PublicKey
  bondPool: PublicKey
  bondedMint: PublicKey
  mintTo: PublicKey
}): Promise<TransactionInstruction> {
  const bondingProgramId = soceanConfiguration.bondingProgramId[cluster]

  if (!bondingProgramId) {
    throw new Error(
      'unsupported cluster to create mintBondedTokens instruction'
    )
  }

  const [bondMintAuthority, vault] = await Promise.all([
    (async () => {
      const [
        bondMintAuthority,
        bondMintAuthorityBump,
      ] = await findBondMintAuthorityPDA(bondingProgramId, bondPool)

      await createBondMintAuthorityPDA(
        bondingProgramId,
        bondPool,
        bondMintAuthorityBump
      )

      return bondMintAuthority
    })(),

    (async () => {
      const [vault, vaultBump] = await findVaultPDA(bondingProgramId, bondPool)

      await createVaultPda(bondingProgramId, bondPool, vaultBump)

      return vault
    })(),
  ])

  console.log('MindBondedTokens', {
    owner: authority.toString(),
    depositFrom: depositFrom.toString(),
    mintTo: mintTo.toString(),
    vault: vault.toString(),
    bondedMint: bondedMint.toString(),
    bondMintAuthority: bondMintAuthority.toString(),
    bondPool: bondPool.toString(),
    tokenProgram: TOKEN_PROGRAM_ID.toString(),
  })

  return program.instruction.deposit(amount, {
    accounts: {
      owner: authority,
      depositFrom,
      mintTo,
      vault,
      bondedMint,
      bondMintAuthority,
      bondPool,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
}
