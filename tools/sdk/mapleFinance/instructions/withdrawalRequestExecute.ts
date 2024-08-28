import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import { MapleFinance, PoolName } from '../configuration';
import { Nonce } from '@maplelabs/syrup-sdk';
import { USyrupIDL } from '../idls/syrup';
import { Program } from '@coral-xyz/anchor';

export async function withdrawalRequestExecute({
  poolName,
  authority: lenderOwner,
  programs,
  destinationAccount,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: Program<USyrupIDL>;
  destinationAccount: PublicKey;
}): Promise<TransactionInstruction> {
  const {
    pool,
    globals,
    poolLocker,
    baseMint,
    sharesMint,
  } = MapleFinance.pools[poolName];

  const lender = await MapleFinance.findLenderAddress(poolName, lenderOwner);

  const nonce = Nonce.generate();

  const withdrawalRequest = await MapleFinance.findWithdrawalRequestAddress(
    lender,
    nonce,
  );

  const withdrawalRequestLocker = await MapleFinance.findWithdrawalRequestLocker(
    withdrawalRequest,
  );

  return programs.instruction.withdrawalRequestExecute({
    accounts: {
      withdrawalRequest,
      lenderOwner,
      lender,
      pool,
      globals,
      baseMint: baseMint.mint,
      poolLocker,
      sharesMint,
      withdrawalRequestLocker,
      lenderLocker: destinationAccount,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}

export default withdrawalRequestExecute;
