import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@uxdprotocol/uxd-client';
import { uiAmountToNativeBN } from '../units';
import { buildLifinity, getPoolByLabel } from './lifinity';

const withdrawFromPool = async ({
  connection,
  wallet,
  liquidityPool,
  userTransferAuthority,
  amountTokenLP,
  amountTokenA,
  amountTokenB,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  liquidityPool: string;
  userTransferAuthority: PublicKey;
  amountTokenLP: number;
  amountTokenA: number;
  amountTokenB: number;
}) => {
  const program = buildLifinity({ connection, wallet });

  const pool = getPoolByLabel(liquidityPool);
  const [authority] = await PublicKey.findProgramAddress(
    [new PublicKey(pool.amm).toBuffer()],
    program.programId,
  );

  const [destTokenA] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolCoinMint),
  );
  const [destTokenB] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolPcMint),
  );
  const [sourceTokenLP] = findATAAddrSync(
    userTransferAuthority,
    new PublicKey(pool.poolMint),
  );

  const itx = program.instruction.withdrawAllTokenTypes(
    uiAmountToNativeBN(amountTokenLP, pool.poolMintDecimal),
    uiAmountToNativeBN(amountTokenA, pool.poolCoinDecimal),
    uiAmountToNativeBN(amountTokenB, pool.poolPcDecimal),
    {
      accounts: {
        amm: new PublicKey(pool.amm),
        authority: authority,
        userTransferAuthorityInfo: userTransferAuthority,
        sourceInfo: sourceTokenLP,
        tokenA: new PublicKey(pool.poolCoinTokenAccount),
        tokenB: new PublicKey(pool.poolPcTokenAccount),
        poolMint: new PublicKey(pool.poolMint),
        destTokenAInfo: destTokenA,
        destTokenBInfo: destTokenB,
        feeAccount: new PublicKey(pool.feeAccount),
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [],
    },
  );

  return itx;
};

export default withdrawFromPool;
