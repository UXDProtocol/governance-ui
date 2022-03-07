import { DescendingAuctionProgram } from './programs/descending-auction'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  findAuctionAuthority,
  findAuctionPool,
} from '@soceanfi/descending-auction/dist/pda'
import { EndpointTypes } from '@models/types'
import soceanConfiguration from './configuration'
import { BN } from '@project-serum/anchor'

export async function initializeAuction({
  cluster,
  program,
  auction,
  authority,
  paymentMint,
  paymentDestination,
  saleMint,
  startTimestamp,
  endTimestamp,
  ceilPrice,
  floorPrice,
}: {
  cluster: EndpointTypes
  program: DescendingAuctionProgram
  auction: PublicKey
  authority: PublicKey
  paymentMint: PublicKey
  paymentDestination: PublicKey
  saleMint: PublicKey
  startTimestamp: BN
  endTimestamp: BN
  ceilPrice: BN
  floorPrice: BN
}): Promise<TransactionInstruction> {
  const descendingAuctionProgramId =
    soceanConfiguration.descendingAuctionProgramId[cluster]

  if (!descendingAuctionProgramId) {
    throw new Error('unsupported cluster to create createAuction instruction')
  }

  const [
    [auctionAuthority, auctionAuthorityBump],
    [auctionPool, auctionPoolBump],
  ] = await Promise.all([
    findAuctionAuthority(descendingAuctionProgramId, auction),
    findAuctionPool(descendingAuctionProgramId, auction, saleMint),
  ])

  console.log('initializeAuction <<<<', {
    cluster,
    auction: auction.toString(),
    authority: authority.toString(),
    paymentMint: paymentMint.toString(),
    paymentDestination: paymentDestination.toString(),
    saleMint: saleMint.toString(),
    descendingAuctionProgramId: descendingAuctionProgramId.toString(),
    startTimestamp,
    endTimestamp,
    ceilPrice,
    floorPrice,
    auctionAuthority: auctionAuthority.toString(),
    auctionAuthorityBump,
    auctionPool: auctionPool.toString(),
    auctionPoolBump,
  })

  return program.instruction.initializeAuction(
    startTimestamp,
    endTimestamp,
    ceilPrice,
    floorPrice,
    auctionAuthorityBump,
    auctionPoolBump,
    {
      accounts: {
        auction,
        auctionAuthority,
        authority,
        paymentMint,
        paymentDestination,
        saleMint,
        auctionPool,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    }
  )
}
