import { BN } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { getATAAddress } from '@saberhq/token-utils'

import saberTribecaConfiguration from './configuration'
import LockerProgram, { LockerData } from './lockerProgram'

export async function lockInstruction({
  lockerProgram,
  lockerData,
  authority,
  amount,
  durationSeconds,
}: {
  lockerProgram: LockerProgram
  lockerData: LockerData
  authority: PublicKey
  amount: BN
  durationSeconds: BN
}): Promise<TransactionInstruction> {
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const {
    tokens: escrowTokens,
    owner: escrowOwner,
  } = await lockerProgram.program.account.escrow.fetch(escrow)

  const sourceTokens = await getATAAddress({
    mint: saberTribecaConfiguration.saberToken.mint,
    owner: escrowOwner,
  })

  return lockerProgram.program.instruction.lock(amount, durationSeconds, {
    accounts: {
      locker: saberTribecaConfiguration.locker,
      escrow,
      escrowOwner,
      escrowTokens,
      sourceTokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: lockerData.params.whitelistEnabled
      ? [
          {
            pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: PublicKey.default,
            isSigner: false,
            isWritable: false,
          },
        ]
      : [],
  })
}
