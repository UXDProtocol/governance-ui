import { BN } from '@project-serum/anchor';
import { depositInstruction } from '@saberhq/stableswap-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findAssociatedTokenAddress } from '@utils/associated';
import saberPoolsConfiguration, { Pool } from './configuration';

export async function deposit({
  authority,
  pool,
  sourceA,
  sourceB,
  tokenAmountA,
  tokenAmountB,
  minimumPoolTokenAmount,
}: {
  authority: PublicKey;
  pool: Pool;
  sourceA: PublicKey;
  sourceB: PublicKey;
  tokenAmountA: BN;
  tokenAmountB: BN;
  minimumPoolTokenAmount: BN;
}): Promise<TransactionInstruction> {
  const poolTokenMintATA = await findAssociatedTokenAddress(
    authority,
    pool.poolToken.mint,
  );

  // TRICKS
  // Have to add manually the toBuffer method as it's required by the @saberhq/stableswap-sdk package
  // le = little endian
  // 8 = 8 bytes = 64 bits
  tokenAmountA.toBuffer = () => tokenAmountA.toArrayLike(Buffer, 'le', 8);
  tokenAmountB.toBuffer = () => tokenAmountB.toArrayLike(Buffer, 'le', 8);
  minimumPoolTokenAmount.toBuffer = () =>
    minimumPoolTokenAmount.toArrayLike(Buffer, 'le', 8);

  console.log('deposit', {
    config: {
      authority: pool.swapAccountAuthority.toString(),
      swapAccount: pool.swapAccount.toString(),
      swapProgramID:
        saberPoolsConfiguration.saberStableSwapProgramId.toString(),
      tokenProgramID: TOKEN_PROGRAM_ID.toString(),
    },
    userAuthority: authority.toString(),
    sourceA: sourceA.toString(),
    sourceB: sourceB.toString(),
    tokenAccountA: pool.tokenAccountA.mint.toString(),
    tokenAccountB: pool.tokenAccountB.mint.toString(),
    poolTokenMint: pool.poolToken.mint.toString(),
    poolTokenAccount: poolTokenMintATA.toString(),
    tokenAmountA: tokenAmountA.toString(),
    tokenAmountB: tokenAmountB.toString(),
    minimumPoolTokenAmount: minimumPoolTokenAmount.toString(),
  });

  return depositInstruction({
    config: {
      authority: pool.swapAccountAuthority,
      swapAccount: pool.swapAccount,
      swapProgramID: saberPoolsConfiguration.saberStableSwapProgramId,
      tokenProgramID: TOKEN_PROGRAM_ID,
    },
    userAuthority: authority,
    sourceA,
    sourceB,
    tokenAccountA: pool.tokenAccountA.mint,
    tokenAccountB: pool.tokenAccountB.mint,
    poolTokenMint: pool.poolToken.mint,
    poolTokenAccount: poolTokenMintATA,
    tokenAmountA,
    tokenAmountB,
    minimumPoolTokenAmount,
  });
}
