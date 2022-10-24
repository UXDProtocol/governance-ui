import { Provider } from '@project-serum/anchor';
import {
  MangoV3ReimbursementClient,
  ID as MangoV3ReimbursementProgramId,
} from '@blockworks-foundation/mango-v3-reimbursement-lib/dist/client';
import {
  TransactionInstruction,
  PublicKey,
  Transaction,
  sendAndConfirmRawTransaction,
} from '@solana/web3.js';
import {
  Controller,
  findATAAddrSync,
  UXD_DECIMALS,
} from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  uxdClient,
  instantiateMangoDepository,
  getDepositoryMintInfo,
  getInsuranceMintInfo,
} from './uxdClient';
import { createAssociatedTokenAccount } from '@utils/associated';
import { Wallet } from '@marinade.finance/marinade-ts-sdk';

async function findMangoReimbursementAccountAddress(
  mangoReimbursementGroup: PublicKey,
  mangoAccountOwner: PublicKey,
) {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('ReimbursementAccount'),
        mangoReimbursementGroup.toBuffer()!,
        mangoAccountOwner.toBuffer(),
      ],
      MangoV3ReimbursementProgramId,
    )
  )[0];
}

const createMangoReimburseInstruction = async ({
  wallet,
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  tokenMint,
  payer,
  mangoReimbursementGroup,
  mangoReimbursementTable,
}: {
  wallet: Wallet;
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  tokenMint: PublicKey;
  payer: PublicKey;
  mangoReimbursementGroup: PublicKey;
  mangoReimbursementTable: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const {
    address: depositoryMint,
    decimals: depositoryDecimals,
  } = getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const {
    address: insuranceMint,
    decimals: insuranceDecimals,
  } = getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  const mangoV3ReimbursementClient = new MangoV3ReimbursementClient(
    new Provider(
      connection.current,
      {} as any,
      Provider.defaultOptions(),
    ) as any,
  );

  const onChainMangoReimbursementGroup = await mangoV3ReimbursementClient.program.account.group.fetch(
    mangoReimbursementGroup,
  );

  const tokenIndex = onChainMangoReimbursementGroup.mints.findIndex((mint) =>
    mint.equals(tokenMint),
  );
  const mangoReimbursementVault =
    onChainMangoReimbursementGroup.vaults[tokenIndex];
  const mangoReimbursementClaimMint =
    onChainMangoReimbursementGroup.claimMints[tokenIndex];

  const [mangoReimbursementClaimMintTokenAccount] = findATAAddrSync(
    onChainMangoReimbursementGroup.claimTransferDestination,
    mangoReimbursementClaimMint,
  );

  // ================ Setup the reimbursement account ========================
  const mangoReimbursementAccount = await findMangoReimbursementAccountAddress(
    mangoReimbursementGroup,
    depository.pda,
  );

  const tx = new Transaction();

  if (!(await connection.current.getAccountInfo(mangoReimbursementAccount))) {
    const ix = await mangoV3ReimbursementClient.program.methods
      .createReimbursementAccount()
      .accounts({
        group: mangoReimbursementGroup,
        mangoAccountOwner: depository.pda,
        payer,
      })
      .instruction();

    tx.add(ix);
  } else {
    console.log(
      'Reimbursement account already set up',
      mangoReimbursementAccount.toBase58(),
    );
  }
  // ==========================================================================

  // Create the token mint ATA for the governance
  const [authorityTokenAccount] = findATAAddrSync(authority, tokenMint);
  const [depositoryTokenAccount] = findATAAddrSync(depository.pda, tokenMint);

  if (!(await connection.current.getAccountInfo(authorityTokenAccount))) {
    const [ix] = await createAssociatedTokenAccount(
      payer,
      authority,
      tokenMint,
    );

    tx.add(ix);
  }

  if (!(await connection.current.getAccountInfo(depositoryTokenAccount))) {
    const [ix] = await createAssociatedTokenAccount(
      payer,
      depository.pda,
      tokenMint,
    );

    tx.add(ix);
  }

  if (tx.instructions.length) {
    tx.feePayer = payer;
    tx.recentBlockhash = (
      await connection.current.getLatestBlockhash()
    ).blockhash;

    await wallet.signTransaction(tx);

    const signature = await sendAndConfirmRawTransaction(
      connection.current,
      tx.serialize(),
    );

    // const signature = await sendSignedTransaction(connection.current, tx, []);
    console.log(
      `Setup ATA and mango reimbursement account: https://explorer.solana.com/tx/${signature}`,
    );
  }

  // Find at the mango_account_owner within the table
  const rows = await mangoV3ReimbursementClient.decodeTable(
    onChainMangoReimbursementGroup,
  );

  const indexToTable = rows.findIndex((row) =>
    row.owner.equals(depository.pda),
  );

  console.log('INFOS', {
    uxdProgramId: uxdProgramId.toBase58(),
    depository: depository.pda.toBase58(),
    authority: authority.toBase58(),
    tokenMint: tokenMint.toBase58(),
    tokenIndex,
    MangoV3ReimbursementProgramId: MangoV3ReimbursementProgramId.toBase58(),
    mangoReimbursementGroup: mangoReimbursementGroup.toBase58(),
    mangoReimbursementVault: mangoReimbursementVault.toBase58(),
    mangoReimbursementAccount: mangoReimbursementAccount.toBase58(),
    mangoReimbursementClaimMintTokenAccount: mangoReimbursementClaimMintTokenAccount.toBase58(),
    mangoReimbursementClaimMint: mangoReimbursementClaimMint.toBase58(),
    mangoReimbursementTable: mangoReimbursementTable.toBase58(),
    indexToTable,
  });

  return client.createMangoReimburseInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    authority,
    tokenMint,
    tokenIndex,
    MangoV3ReimbursementProgramId,
    mangoReimbursementGroup,
    mangoReimbursementVault,
    mangoReimbursementAccount,
    mangoReimbursementClaimMintTokenAccount,
    mangoReimbursementClaimMint,
    mangoReimbursementTable,
    indexToTable,
    Provider.defaultOptions(),
    payer,
  );
};

export default createMangoReimburseInstruction;
