import { BN } from '@project-serum/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { getATAAddress } from '@saberhq/token-utils'

import saberTribecaConfiguration, {
  SaberTribecaPrograms,
} from './configuration'
import { LockerData } from './programs'

export async function lockInstruction({
  programs,
  lockerData,
  authority,
  amount,
  durationSeconds,
}: {
  programs: SaberTribecaPrograms
  lockerData: LockerData
  authority: PublicKey
  amount: BN
  durationSeconds: BN
}): Promise<TransactionInstruction> {
  const [escrow] = await saberTribecaConfiguration.findEscrowAddress(authority)

  const {
    tokens: escrowTokens,
    owner: escrowOwner,
  } = await programs.LockedVoter.account.escrow.fetch(escrow)

  const sourceTokens = await getATAAddress({
    mint: saberTribecaConfiguration.saberToken.mint,
    owner: escrowOwner,
  })

  const [whitelistEntry] = await saberTribecaConfiguration.findWhitelistAddress(
    saberTribecaConfiguration.locker,
    authority
  )

  console.log({
    locker: saberTribecaConfiguration.locker.toString(),
    escrow: escrow.toString(),
    escrowOwner: escrowOwner.toString(),
    escrowTokens: escrowTokens.toString(),
    sourceTokens: sourceTokens.toString(),
    tokenProgram: TOKEN_PROGRAM_ID.toString(),
    whitelistEntry: whitelistEntry.toString(),
    SYSVAR_INSTRUCTIONS_PUBKEY: SYSVAR_INSTRUCTIONS_PUBKEY.toString(),
  })

  return programs.LockedVoter.instruction.lock(amount, durationSeconds, {
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
            pubkey: whitelistEntry,
            isSigner: false,
            isWritable: false,
          },
        ]
      : [],
  })
}
