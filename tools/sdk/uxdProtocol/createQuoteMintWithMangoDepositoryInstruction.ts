import { AnchorProvider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import type { ConnectionContext } from 'utils/connection';
import {
  uxdClient,
  instantiateMangoDepository,
  getDepositoryMintInfo,
  getInsuranceMintInfo,
  initializeMango,
} from './uxdClient';

const createQuoteMintWithMangoDepositoryInstruction = async ({
  connection,
  uxdProgramId,
  authority,
  depositoryMintName,
  insuranceMintName,
  quoteAmount,
  payer,
}: {
  connection: ConnectionContext;
  uxdProgramId: PublicKey;
  authority: PublicKey;
  depositoryMintName: string;
  insuranceMintName: string;
  quoteAmount: number;
  payer: PublicKey;
}): Promise<TransactionInstruction> => {
  const client = uxdClient(uxdProgramId);

  const mango = await initializeMango(connection.current, connection.cluster);

  const { address: depositoryMint, decimals: depositoryDecimals } =
    getDepositoryMintInfo(connection.cluster, depositoryMintName);

  const { address: insuranceMint, decimals: insuranceDecimals } =
    getInsuranceMintInfo(connection.cluster, insuranceMintName);

  const depository = instantiateMangoDepository({
    uxdProgramId,
    depositoryMint,
    insuranceMint,
    depositoryName: depositoryMintName,
    depositoryDecimals,
    insuranceName: insuranceMintName,
    insuranceDecimals,
  });

  return client.createQuoteMintWithMangoDepositoryInstruction(
    quoteAmount,
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    depository,
    mango,
    authority,
    AnchorProvider.defaultOptions(),
    payer,
  );
};

export default createQuoteMintWithMangoDepositoryInstruction;
