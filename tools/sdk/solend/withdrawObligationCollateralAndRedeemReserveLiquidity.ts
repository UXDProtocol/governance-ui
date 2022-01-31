import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { withdrawObligationCollateralAndRedeemReserveLiquidity as originalWithdrawFunction } from '@solendprotocol/solend-sdk'
import { findATAAddrSync } from '@uxdprotocol/uxd-client'
import {
  SolendDeposableAndWithdrawableSupportedMint,
  SOLEND_ADDRESSES_PER_TOKEN,
  SOLEND_LENDING_MARKET,
  SOLEND_LENDING_MARKET_AUTHORITY,
  SOLEND_PROGRAM_ID,
} from './constant'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function withdrawObligationCollateralAndRedeemReserveLiquidity({
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
    reserveCollateralSupplySplTokenAccount,
  } = SOLEND_ADDRESSES_PER_TOKEN[mintName]

  const reserveCollateralMint = relatedCollateralMint

  const [usdcTokenAccount] = findATAAddrSync(obligationOwner, mint)
  const [cusdcTokenAccount] = findATAAddrSync(
    obligationOwner,
    relatedCollateralMint
  )

  const obligation = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  const transferAuthority = obligationOwner
  const sourceCollateral = reserveCollateralSupplySplTokenAccount
  const destinationCollateral = cusdcTokenAccount
  const withdrawReserve = reserve
  const destinationLiquidity = usdcTokenAccount

  return originalWithdrawFunction(
    liquidityAmount,
    sourceCollateral,
    destinationCollateral,
    withdrawReserve,
    obligation,
    SOLEND_LENDING_MARKET,
    SOLEND_LENDING_MARKET_AUTHORITY,
    destinationLiquidity,
    reserveCollateralMint,
    reserveLiquiditySupply,
    obligationOwner,
    transferAuthority,
    SOLEND_PROGRAM_ID
  )
}
