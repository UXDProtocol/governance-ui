import { getATAAddress } from '@saberhq/token-utils';
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';

import { MapleFinance, PoolName } from '../configuration';
import { BN } from '@project-serum/anchor';
import { Nonce } from '@maplelabs/syrup-sdk';
import { USyrupIDL } from '../idls/syrup';
import { Program } from '@coral-xyz/anchor';

export async function withdrawalRequestInitialize({
  poolName,
  authority: lenderOwner,
  programs,
  withdrawSharesAmount,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: Program<USyrupIDL>;
  withdrawSharesAmount: BN;
}): Promise<TransactionInstruction> {
  const { pool, globals, sharesMint } = MapleFinance.pools[poolName];

  const lender = await MapleFinance.findLenderAddress(poolName, lenderOwner);

  const lenderShareAccount = await getATAAddress({
    mint: sharesMint,
    owner: lenderOwner,
  });

  const nonce = Nonce.generate();

  const withdrawalRequest = await MapleFinance.findWithdrawalRequestAddress(
    lender,
    nonce,
  );

  const withdrawalRequestLocker = await MapleFinance.findWithdrawalRequestLocker(
    withdrawalRequest,
  );

  return programs.instruction.withdrawalRequestInitialize(
    nonce.asParam(),
    withdrawSharesAmount,
    {
      accounts: {
        lender,
        lenderOwner,
        pool,
        globals,
        sharesMint,
        lenderShareAccount,
        withdrawalRequest,
        withdrawalRequestLocker,
        systemProgram: SYSTEM_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      },
    },
  );
}

export default withdrawalRequestInitialize;
