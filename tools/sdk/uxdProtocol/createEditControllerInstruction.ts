import { Provider } from '@project-serum/anchor';
import { TransactionInstruction, PublicKey } from '@solana/web3.js';
import { Controller, UXD_DECIMALS } from '@uxd-protocol/uxd-client';
import { uxdClient } from './uxdClient';

const createEditControllerInstruction = ({
  uxdProgramId,
  authority,
  redeemableGlobalSupplyCap,
  depositoriesRoutingWeightBps,
  routerDepositories,
  outflowLimitPerEpochAmount,
  outflowLimitPerEpochBps,
  slotsPerEpoch,
}: {
  uxdProgramId: PublicKey;
  authority: PublicKey;
  redeemableGlobalSupplyCap?: number;
  depositoriesRoutingWeightBps?: {
    identityDepositoryWeightBps: number;
    mercurialVaultDepositoryWeightBps: number;
    credixLpDepositoryWeightBps: number;
  };
  routerDepositories?: {
    identityDepository: PublicKey;
    mercurialVaultDepository: PublicKey;
    credixLpDepository: PublicKey;
  };
  outflowLimitPerEpochAmount?: number;
  outflowLimitPerEpochBps?: number;
  slotsPerEpoch?: number;
}): TransactionInstruction => {
  const client = uxdClient(uxdProgramId);

  return client.createEditControllerInstruction(
    new Controller('UXD', UXD_DECIMALS, uxdProgramId),
    authority,
    {
      redeemableGlobalSupplyCap,
      depositoriesRoutingWeightBps,
      routerDepositories,
      outflowLimitPerEpochAmount,
      outflowLimitPerEpochBps,
      slotsPerEpoch,
    },
    Provider.defaultOptions(),
  );
};

export default createEditControllerInstruction;
