import { Governance, InstructionData } from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { RpcContext } from '@solana/spl-governance';
import { MintInfo } from '@solana/spl-token';
import { PublicKey, Keypair, TransactionInstruction } from '@solana/web3.js';
import { getNameOf } from '@tools/core/script';
import { SupportedMintName } from '@tools/sdk/solend/configuration';
import { SupportedMintName as QuarryMineSupportedMintName } from '@tools/sdk/quarryMine/configuration';
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedTokenAccount,
} from '@utils/tokens';
import { SplTokenUIName } from '@utils/splTokens';
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts';
import { LockupKind } from 'VoteStakeRegistry/tools/types';
import { AmountSide } from '@raydium-io/raydium-sdk';
import ATribecaConfiguration from '@tools/sdk/tribeca/ATribecaConfiguration';
import { InstructionType } from '@hooks/useGovernanceAssets';
import { SupportedSaberPoolNames } from '@tools/sdk/saberPools/configuration';

export interface FormInstructionData {
  serializedInstruction: string;
  isValid: boolean;
  governance: ProgramAccount<Governance> | undefined;
  customHoldUpTime?: number;
  prerequisiteInstructions?: TransactionInstruction[];
  chunkSplitByDefault?: boolean;
  signers?: Keypair[];
  shouldSplitIntoSeparateTxs?: boolean | undefined;
}

export interface SplTokenTransferForm {
  destinationAccount: string;
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  programId: string | undefined;
  mintInfo: MintInfo | undefined;
}

export interface FriktionDepositForm {
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  voltVaultId: string;
  programId: string | undefined;
  mintInfo: MintInfo | undefined;
}

export interface GrantForm {
  destinationAccount: string;
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  mintInfo: MintInfo | undefined;
  lockupKind: LockupKind;
  startDateUnixSeconds: number;
  periods: number;
  allowClawback: boolean;
}

export interface ClawbackForm {
  governedTokenAccount: GovernedTokenAccount | undefined;
  voter: Voter | null;
  deposit: DepositWithMintAccount | null;
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
  description: string;
  title: string;
}

export interface StakingViewForm {
  destinationAccount: GovernedTokenAccount | undefined;
  amount: number | undefined;
  governedTokenAccount: GovernedTokenAccount | undefined;
  description: string;
  title: string;
}

export interface MintForm {
  destinationAccount: string;
  amount: number | undefined;
  mintAccount: GovernedMintInfoAccount | undefined;
  programId: string | undefined;
}

export interface ProgramUpgradeForm {
  governedAccount?: GovernedMultiTypeAccount;
  bufferAddress?: string;
  bufferSpillAddress?: string;
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>();

export interface SetProgramAuthorityForm {
  governedAccount?: GovernedMultiTypeAccount;
  destinationAuthority?: string;
}
export interface Base64InstructionForm {
  governedAccount?: GovernedMultiTypeAccount;
  base64: string;
  holdUpTime: number;
}

export interface EmptyInstructionForm {
  governedAccount?: GovernedMultiTypeAccount;
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
  splTokenMintUIName?: SplTokenUIName;
}

export interface CreateSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
}

export interface InitSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount;
}

export interface DepositReserveLiquidityAndObligationCollateralForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount: number;
  mintName?: SupportedMintName;
}

export interface WithdrawObligationCollateralAndRedeemReserveLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount: number;
  mintName?: SupportedMintName;
  destinationLiquidity?: string;
}

export interface RefreshObligationForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: SupportedMintName;
}

export interface RefreshReserveForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: SupportedMintName;
}

export interface AddLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount;
  liquidityPool?: string;
  baseAmountIn?: number;
  quoteAmountIn?: number;
  fixedSide: AmountSide;
  slippage: number;
}

export interface RemoveLiquidityRaydiumForm {
  governedAccount?: GovernedMultiTypeAccount;
  liquidityPool: string;
  amountIn: number;
}

export interface InitializeControllerForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintDecimals: number;
}

export interface SetRedeemableGlobalSupplyCapForm {
  governedAccount?: GovernedMultiTypeAccount;
  supplyCap: number;
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount?: GovernedMultiTypeAccount;
  softCap: number;
}

export interface RegisterMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  insuranceName?: string;
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  insuranceName?: string;
  insuranceDepositedAmount: number;
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount?: GovernedMultiTypeAccount;
  collateralName?: string;
  insuranceName?: string;
  insuranceWithdrawnAmount: number;
}

export interface SaberPoolsDepositForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  sourceA?: string;
  sourceB?: string;
  uiTokenAmountA?: number;
  uiTokenAmountB?: number;
  uiMinimumPoolTokenAmount?: number;
}

export interface SaberPoolsWithdrawOneForm {
  governedAccount?: GovernedMultiTypeAccount;
  poolName?: SupportedSaberPoolNames;
  destinationAccount?: PublicKey;
  baseTokenName?: string;
  uiPoolTokenAmount?: number;
  uiMinimumTokenAmount?: number;
}

export interface SaberPeripheryRedeemAllTokensFromMintProxyForm {
  governedAccount?: GovernedMultiTypeAccount;
  mintName?: QuarryMineSupportedMintName;
}

export interface SoceanMintBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiAmount?: number;
  depositFrom?: string;
  bondPool?: string;
  bondedMint?: string;
  mintTo?: string;
}

export interface SoceanDepositToAuctionPoolForm {
  governedAccount?: GovernedMultiTypeAccount;
  uiDepositAmount?: number;
  auction?: string;
  sourceAccount?: string;
  bondedMint?: string;
}

export interface SoceanCloseAuctionForm {
  governedAccount?: GovernedMultiTypeAccount;
  auction?: string;
  bondedMint?: string;
  destinationAccount?: string;
}

export interface SoceanPurchaseBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount;
  auction?: string;
  bondedMint?: string;
  paymentDestination?: string;
  buyer?: string;
  paymentSource?: string;
  saleDestination?: string;
  uiPurchaseAmount?: number;
  uiExpectedPayment?: number;
  slippageTolerance?: number;
}

export interface SoceanCancelVestForm {
  governedAccount?: GovernedMultiTypeAccount;
  bondPool?: string;
  bondedMint?: string;
  userBondedAccount?: string;
  userTargetAccount?: string;
}

export interface SoceanVestForm {
  governedAccount?: GovernedMultiTypeAccount;
  bondPool?: string;
  bondedMint?: string;
  userBondedAccount?: string;
  uiAmount?: number;
}

export interface TribecaCreateEpochGaugeForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaCreateEscrowGovernanceTokenATAForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaCreateGaugeVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaCreateGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaGaugeCommitVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaGaugeRevertVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
}

export interface TribecaLockForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
  uiAmount: number;
  durationSeconds: number;
}

export interface TribecaNewEscrowForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaPrepareEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaResetEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount;
  tribecaConfiguration: ATribecaConfiguration | null;
}

export interface TribecaGaugeSetVoteForm {
  governedAccount?: GovernedMultiTypeAccount;
  gaugeName?: string;
  weight?: number;
}

export interface UXDStakingInitializeStakingCampaignForm {
  governedAccount?: GovernedMultiTypeAccount;
  rewardMintUIName?: SplTokenUIName;
  stakedMintUIName?: SplTokenUIName;
  startTs?: number;
  endTs?: number;
  uiRewardAmountToDeposit?: number;
}

export interface UXDStakingFinalizeStakingCampaignForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
}

export interface UXDStakingAddStakingOptionForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  stakingOptions: {
    lockupSecs?: number;
    apr?: number;
  }[];
}

export interface UXDStakingActivateStakingOptionForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  activate?: boolean;
  stakingOptionIdentifier?: number;
}

export interface UXDStakingRefillRewardVaultForm {
  governedAccount?: GovernedMultiTypeAccount;
  stakingCampaignPda?: string;
  uiRewardRefillAmount?: number;
}

export enum InstructionEnum {
  Transfer,
  ProgramUpgrade,
  SetProgramAuthority,
  Mint,
  Base64,
  None,
  Grant,
  Clawback,
  CreateAssociatedTokenAccount,
  FriktionDepositIntoVolt,
  QuarryClaimRewards,
  QuarryCreateMiner,
  QuarryCreateMinerVaultAccount,
  QuarryStakeTokens,
  QuarryWithdrawTokens,
  RaydiumAddLiquidity,
  RaydiumRemoveLiquidity,
  SaberPoolsDeposit,
  SaberPoolsWithdrawOne,
  SaberPeripheryRedeemAllTokensFromMintProxy,
  SolendCreateObligationAccount,
  SolendInitObligationAccount,
  SolendDepositReserveLiquidityAndObligationCollateral,
  SolendWithdrawObligationCollateralAndRedeemReserveLiquidity,
  SolendRefreshObligation,
  SolendRefreshReserve,
  SoceanMintBondedTokens,
  SoceanDepositToAuctionPool,
  SoceanCloseAuction,
  SoceanPurchaseBondedTokens,
  SoceanCancelVest,
  SoceanVest,
  TribecaCreateEpochGauge,
  TribecaCreateEscrowGovernanceTokenATA,
  TribecaCreateGaugeVote,
  TribecaCreateGaugeVoter,
  TribecaGaugeCommitVote,
  TribecaGaugeRevertVote,
  TribecaLock,
  TribecaNewEscrow,
  TribecaPrepareEpochGaugeVoter,
  TribecaResetEpochGaugeVoter,
  TribecaGaugeSetVote,
  UXDInitializeController,
  UXDSetRedeemableGlobalSupplyCap,
  UXDSetMangoDepositoriesRedeemableSoftCap,
  UXDRegisterMangoDepository,
  UXDDepositInsuranceToMangoDepository,
  UXDWithdrawInsuranceFromMangoDepository,
  UXDStakingInitializeStakingCampaign,
  UXDStakingFinalizeStakingCampaign,
  UXDStakingAddStakingOption,
  UXDStakingActivateStakingOption,
  UXDStakingRefillRewardVault,
}

export enum PackageEnum {
  Native,
  VoteStakeRegistry,
  Solend,
  Raydium,
  UXD,
  UXDStaking,
  Friktion,
  Tribeca,
  Socean,
  Saber,
  Quarry,
}

export type createParams = [
  rpc: RpcContext,
  realm: PublicKey,
  governance: PublicKey,
  tokenOwnerRecord: PublicKey,
  name: string,
  descriptionLink: string,
  governingTokenMint: PublicKey,
  holdUpTime: number,
  proposalIndex: number,
  instructionsData: InstructionData[],
  isDraft: boolean,
];

export interface ComponentInstructionData {
  governedAccount?: ProgramAccount<Governance>;
  getInstruction?: () => Promise<FormInstructionData>;
  type?: InstructionType;
}

export interface InstructionsContext {
  instructions: ComponentInstructionData[];
  handleSetInstruction: (
    val: Partial<ComponentInstructionData>,
    idx: number,
  ) => void;
}
