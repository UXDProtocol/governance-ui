import { Connection, PublicKey } from '@solana/web3.js';
import { USyrupJSON, USyrupIDL } from './idls/syrup';

import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { SPL_TOKENS } from '@utils/splTokens';
import { Nonce } from '@maplelabs/syrup-sdk';
import { AnchorProvider, Program, Provider, Wallet } from '@coral-xyz/anchor';

export type PoolName = 'Cash Management USDC';

export type PoolInfo = {
  // lender: PublicKey;
  pool: PublicKey;
  globals: PublicKey;
  poolLocker: PublicKey;
  sharesMint: PublicKey;
  // lockedShares: PublicKey;
  // lenderShares: PublicKey;
  // lenderLocker: PublicKey;
  baseMint: any;
};

export type Pools = {
  [key in PoolName]: PoolInfo;
};

export class MapleFinance {
  public static readonly SyrupProgramId = new PublicKey(
    '5D9yi4BKrxF8h65NkVE1raCCWFKUs5ngub2ECxhvfaZe',
  );

  public static readonly pools: Pools = {
    "Cash Management USDC": {
      pool: new PublicKey('7Vqn5fdwckZadYVoH312aErP8PqNGNUx8WDrvKAHYfMd'),
      globals: new PublicKey('DtnAPKSHwJaYbFdjYibNcjxihVd6pK1agpT86N5tMVPX'),
      poolLocker: new PublicKey('92oAd9cm4rV4K4Xx9HPRMoFn7GwMaKsjNSPe7QVxywcy'),
      sharesMint: new PublicKey('AxuK8gNvN4Q8HtgHxFbePP6b84SpmcNTPdFA1E164Hgs'),
      baseMint: SPL_TOKENS.USDC,
    },
  };

  public static getPoolInfoByPoolMint(
    poolMint: PublicKey,
  ): PoolInfo | undefined {
    return Object.values(MapleFinance.pools).find((poolInfo) =>
      poolInfo.pool.equals(poolMint),
    );
  }

  // idl: IDL, programId: Address, provider?

  public loadPrograms(provider: Provider): Program<USyrupIDL> {
    return new Program<USyrupIDL>(
      USyrupJSON,
      MapleFinance.SyrupProgramId,
      provider
    );
  }

  public getMapleFinancePrograms({
    connection,
    wallet,
  }: {
    connection: Connection;
    wallet: SignerWalletAdapter;
  }) {
    const programs = this.loadPrograms(
      new AnchorProvider(
        connection,
        wallet as unknown as Wallet,
        {},
      ));

    if (!programs)
      throw new Error('MapleFinance Configuration error: no programs');
    return programs;
  }

  public static async findLenderAddress(
    poolName: PoolName,
    lenderUser: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [
          Buffer.from('lender'),
          MapleFinance.pools[poolName].pool.toBytes(),
          lenderUser.toBytes(),
        ],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findLockedSharesAddress(
    lender: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('locked_shares'), lender.toBytes()],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findWithdrawalRequestAddress(
    lender: PublicKey,
    nonce: Nonce,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('withdrawal_request'), lender.toBytes(), nonce.value],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static async findWithdrawalRequestLocker(
    withdrawalRequest: PublicKey,
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [Buffer.from('withdrawal_request_locker'), withdrawalRequest.toBytes()],
        MapleFinance.SyrupProgramId,
      )
    )[0];
  }

  public static readonly syrupProgramInstructions = {
    lenderDeposit: 151,
    lenderUnlockDeposit: 17,
    withdrawalRequestInitialize: 0,
    withdrawalRequestExecute: 0,
  };
}

export default new MapleFinance();
