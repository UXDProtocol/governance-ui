import { TransactionInstruction } from '@solana/web3.js'
import { refreshReserveInstruction } from '@solendprotocol/solend-sdk'
import {
  SolendDeposableAndWithdrawableSupportedMint as SolendDeposableAndWithdrawableSupportedMint,
  SOLEND_ADDRESSES_PER_TOKEN,
  SOLEND_PROGRAM_ID,
} from './constant'

export async function refreshReserve({
  mintName,
}: {
  mintName: SolendDeposableAndWithdrawableSupportedMint
}): Promise<TransactionInstruction> {
  const {
    reserve,
    pythOracle,
    switchboardFeedAddress,
  } = SOLEND_ADDRESSES_PER_TOKEN[mintName]

  return refreshReserveInstruction(
    reserve,
    SOLEND_PROGRAM_ID,
    pythOracle,
    switchboardFeedAddress
  )
}
