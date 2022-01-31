import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { depositReserveLiquidityAndObligationCollateralInstruction } from '@solendprotocol/solend-sdk'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import {
  SolendDeposableAndWithdrawableSupportedMint,
  SOLEND_ADDRESSES_PER_TOKEN,
  SOLEND_LENDING_MARKET,
  SOLEND_LENDING_MARKET_AUTHORITY,
  SOLEND_PROGRAM_ID,
} from './constant'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function depositReserveLiquidityAndObligationCollateral({
  obligationOwner,
  liquidityAmount,
  mintName,
}: {
  obligationOwner: PublicKey
  liquidityAmount: number | BN
  mintName: SolendDeposableAndWithdrawableSupportedMint
}) {
  const {
    relatedCollateralMint,
    mint,
    reserve,
    reserveLiquiditySupply,
    pythOracle,
    switchboardFeedAddress,
    reserveCollateralSupplySplTokenAccount,
  } = SOLEND_ADDRESSES_PER_TOKEN[mintName]

  const reserveCollateralMint = relatedCollateralMint

  const [usdcTokenAccount] = findATAAddrSync(obligationOwner, mint)
  const [cusdcTokenAccount] = findATAAddrSync(
    obligationOwner,
    relatedCollateralMint
  )

  const sourceLiquidity = usdcTokenAccount
  const sourceCollateral = cusdcTokenAccount
  const destinationCollateral = reserveCollateralSupplySplTokenAccount

  const obligation = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  const transferAuthority = obligationOwner

  return depositReserveLiquidityAndObligationCollateralInstruction(
    liquidityAmount,

    // Example: USDC token account address (owned by obligationOwner)
    sourceLiquidity,

    // Destination Collateral Token Account
    // Example: cUSDC's token account address (owned by obligationOwner)
    sourceCollateral,

    // Solend Reserve Progam Id (must be related to sourceLiquidity)
    // Complete list of reserves mint: https://docs.solend.fi/protocol/addresses
    // Example: BgxfHJDzm44T7XG68MYKx7YisTjZu73tVovyZSjJMpmw for USDC reserve
    reserve,

    // Solend Reserve SPL Token account address (must be related to sourceLiquidity)
    // Example: 8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf for USDC (there are no list for it)
    reserveLiquiditySupply,

    // Example: cUSDC mint (must be related to sourceLiquidity)
    reserveCollateralMint,

    SOLEND_LENDING_MARKET,
    SOLEND_LENDING_MARKET_AUTHORITY,

    destinationCollateral,
    obligation,
    obligationOwner,
    pythOracle,
    switchboardFeedAddress,

    // Wallet address of the one creating the proposal
    transferAuthority,
    SOLEND_PROGRAM_ID
  )
}
