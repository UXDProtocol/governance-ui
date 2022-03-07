import { DescendingAuctionProgram } from './programs/descending-auction'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  findAuctionAuthority,
  findAuctionPool,
} from '@soceanfi/descending-auction'
import { EndpointTypes } from '@models/types'
import soceanConfiguration from './configuration'
import { BN } from '@project-serum/anchor'

export async function depositToAuctionPool({
  cluster,
  program,
  depositAmount,
  auction,
  authority,
  sourceAccount,
  bondedMint,
}: {
  cluster: EndpointTypes
  program: DescendingAuctionProgram
  depositAmount: BN
  auction: PublicKey
  authority: PublicKey
  sourceAccount: PublicKey
  bondedMint: PublicKey
}): Promise<TransactionInstruction> {
  const descendingAuctionProgramId =
    soceanConfiguration.descendingAuctionProgramId[cluster]

  if (!descendingAuctionProgramId) {
    throw new Error(
      'unsupported cluster to create depositToAuctionPool instruction'
    )
  }

  const [[auctionAuthority], [auctionPool]] = await Promise.all([
    findAuctionAuthority(descendingAuctionProgramId, auction),
    findAuctionPool(descendingAuctionProgramId, auction, bondedMint),
  ])

  console.log('Deposit to auction pool', {
    auction: auction.toString(),
    auctionPool: auctionPool.toString(),
    auctionAuthority: auctionAuthority.toString(),
    authority: authority.toString(),
    sourceAccount: sourceAccount.toString(),
    depositAmount: depositAmount.toString(),
  })

  return program.instruction.depositToAuctionPool(depositAmount, {
    accounts: {
      auction,
      auctionPool,
      auctionAuthority,
      authority,
      sourceAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  })
}
