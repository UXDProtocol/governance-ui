import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { Connection, PublicKey } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import BigNumber from 'bignumber.js';
import { buildLifinity, getPoolInfoByName } from './lifinity';
import { PoolNames } from './poolList';

const withdrawFromPool = async ({
  connection,
  wallet,
  poolName,
  userTransferAuthority,
  lpTokenAmount,
  minimumWithdrawnAmountTokenA,
  minimumWithdrawnAmountTokenB,
}: {
  connection: Connection;
  wallet: SignerWalletAdapter;
  poolName: PoolNames;
  userTransferAuthority: PublicKey;
  lpTokenAmount: BigNumber;
  minimumWithdrawnAmountTokenA: BigNumber;
  minimumWithdrawnAmountTokenB: BigNumber;
}) => {
  const program = buildLifinity({ connection, wallet });

  const {
    amm,
    feeAccount,
    lpToken: { mint: mintLpToken },
    tokenA: { mint: mintTokenA, tokenAccount: tokenAccountTokenA },
    tokenB: { mint: mintTokenB, tokenAccount: tokenAccountTokenB },
  } = getPoolInfoByName(poolName);

  const [authority] = await PublicKey.findProgramAddress(
    [amm.toBuffer()],
    program.programId,
  );

  const [destTokenA] = findATAAddrSync(userTransferAuthority, mintTokenA);
  const [destTokenB] = findATAAddrSync(userTransferAuthority, mintTokenB);
  const [sourceTokenLP] = findATAAddrSync(userTransferAuthority, mintLpToken);

  return program.instruction.withdrawAllTokenTypes(
    lpTokenAmount,
    minimumWithdrawnAmountTokenA,
    minimumWithdrawnAmountTokenB,
    {
      accounts: {
        amm,
        feeAccount,
        authority: authority,
        userTransferAuthorityInfo: userTransferAuthority,
        sourceInfo: sourceTokenLP,
        tokenA: tokenAccountTokenA,
        tokenB: tokenAccountTokenB,
        poolMint: mintLpToken,
        destTokenAInfo: destTokenA,
        destTokenBInfo: destTokenB,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [],
    },
  );
};

export default withdrawFromPool;
