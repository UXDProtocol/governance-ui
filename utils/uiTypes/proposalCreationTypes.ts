import { AmountSide } from '@raydium-io/raydium-sdk'
import { Governance, InstructionData } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js'
import { SupportedMintName } from '@tools/sdk/solend/configuration'
import { SplTokenUIName } from '@utils/splTokens'
import { getNameOf } from '@tools/core/script'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  GovernedProgramAccount,
  GovernedTokenAccount,
} from '@utils/tokens'
import { DepositWithMintAccount, Voter } from 'VoteStakeRegistry/sdk/accounts'
import { LockupKind } from 'VoteStakeRegistry/tools/types'
import { SupportedSaberPoolNames } from '@tools/sdk/saberPools/configuration'

export interface UiInstruction {
  serializedInstruction: string
  isValid: boolean
  governance: ProgramAccount<Governance> | undefined
  customHoldUpTime?: number
  prerequisiteInstructions?: TransactionInstruction[]
  chunkSplitByDefault?: boolean
  additionalSigners?: Keypair[]
}
export interface SplTokenTransferForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  programId: string | undefined
  mintInfo: MintInfo | undefined
}

export interface GrantForm {
  destinationAccount: string
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  mintInfo: MintInfo | undefined
  lockupKind: LockupKind
  startDateUnixSeconds: number
  periods: number
  allowClawback: boolean
}

export interface ClawbackForm {
  governedTokenAccount: GovernedTokenAccount | undefined
  voter: Voter | null
  deposit: DepositWithMintAccount | null
}

export interface SendTokenCompactViewForm extends SplTokenTransferForm {
  description: string
  title: string
}

export interface StakingViewForm {
  destinationAccount: GovernedTokenAccount | undefined
  amount: number | undefined
  governedTokenAccount: GovernedTokenAccount | undefined
  description: string
  title: string
}

export interface MintForm {
  destinationAccount: string
  amount: number | undefined
  mintAccount: GovernedMintInfoAccount | undefined
  programId: string | undefined
}

export interface ProgramUpgradeForm {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  bufferAddress: string
  bufferSpillAddress?: string | undefined
}

export interface ProgramAuthorityForm {
  governedAccount: GovernedProgramAccount | GovernedTokenAccount | undefined
  accountId: string | undefined
  destinationAuthority: string
}

export interface AddLiquidityRaydiumForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  liquidityPool: string
  baseAmountIn: number
  quoteAmountIn: number
  fixedSide: AmountSide
}

export interface RemoveLiquidityRaydiumForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  liquidityPool: string
  amountIn: number
}

export const programUpgradeFormNameOf = getNameOf<ProgramUpgradeForm>()

export interface MangoMakeChangeMaxAccountsForm {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  mangoGroupKey: string | undefined
  maxMangoAccounts: number
}
export interface MangoMakeChangeReferralFeeParams {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  mangoGroupKey: string | undefined
  refSurchargeCentibps: number
  refShareCentibps: number
  refMngoRequired: number
}
export interface Base64InstructionForm {
  governedAccount: GovernedMultiTypeAccount | undefined
  base64: string
  holdUpTime: number
}

export interface EmptyInstructionForm {
  governedAccount: GovernedMultiTypeAccount | undefined
}

export interface CreateAssociatedTokenAccountForm {
  governedAccount?: GovernedMultiTypeAccount
  splTokenMintUIName?: SplTokenUIName | 'custom'
  customMint?: PublicKey
}

export interface CreateSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface InitSolendObligationAccountForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface DepositReserveLiquidityAndObligationCollateralForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount: string
  mintName?: SupportedMintName
}

export interface WithdrawObligationCollateralAndRedeemReserveLiquidityForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount: string
  mintName?: SupportedMintName
  destinationLiquidity?: string
}

export interface RefreshObligationForm {
  governedAccount?: GovernedMultiTypeAccount
  mintName?: SupportedMintName
}

export interface RefreshReserveForm {
  governedAccount?: GovernedMultiTypeAccount
  mintName?: SupportedMintName
}

export interface TokenTransferBetweenInternalGovernanceAccountsForm {
  governedAccount?: GovernedMultiTypeAccount
  sourceAccount?: string
  receiverAccount?: string
  uiAmount?: number
}

export interface GovernanceUnderlyingTokenAccountTransferForm {
  governedAccount?: GovernedMultiTypeAccount
  sourceAccount?: string
  receiverAccount?: string
  uiAmount?: number
}

export interface TribecaNewEscrowForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface TribecaLockForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount?: number
  durationSeconds?: number
}

export interface TribecaCreateEscrowSbrATAForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface TribecaCreateGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface TribecaCreateGaugeVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaGaugeSetVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
  weight?: number
}

export interface TribecaPrepareEpochGaugeVoterForm {
  governedAccount?: GovernedMultiTypeAccount
}

export interface TribecaCreateEpochGaugeForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface TribecaGaugeCommitVoteForm {
  governedAccount?: GovernedMultiTypeAccount
  gaugeName?: string
}

export interface SoceanMintBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount
  uiAmount?: number
  depositFrom?: string
  bondPool?: string
  bondedMint?: string
  mintTo?: string
}

export interface SoceanDepositToAuctionPoolForm {
  governedAccount?: GovernedMultiTypeAccount
  uiDepositAmount?: number
  auction?: string
  sourceAccount?: string
  bondedMint?: string
}

export interface SoceanCloseAuctionForm {
  governedAccount?: GovernedMultiTypeAccount
  auction?: string
  bondedMint?: string
  destinationAccount?: string
}

export interface SoceanPurchaseBondedTokensForm {
  governedAccount?: GovernedMultiTypeAccount
  auction?: string
  bondedMint?: string
  paymentDestination?: string
  buyer?: string
  paymentSource?: string
  saleDestination?: string
  uiPurchaseAmount?: number
  uiExpectedPayment?: number
  slippageTolerance?: number
}

export interface SoceanCancelVestForm {
  governedAccount?: GovernedMultiTypeAccount
  bondPool?: string
  bondedMint?: string
  userBondedAccount?: string
  userTargetAccount?: string
}

export interface SoceanVestForm {
  governedAccount?: GovernedMultiTypeAccount
  bondPool?: string
  bondedMint?: string
  userBondedAccount?: string
  uiAmount?: number
}

export interface SaberPoolsDepositForm {
  governedAccount?: GovernedMultiTypeAccount
  poolName?: SupportedSaberPoolNames
  sourceA?: string
  sourceB?: string
  uiTokenAmountA?: number
  uiTokenAmountB?: number
  uiMinimumPoolTokenAmount?: number
}

export interface SaberPoolsWithdrawOneForm {
  governedAccount?: GovernedMultiTypeAccount
  poolName?: SupportedSaberPoolNames
  destinationAccount?: PublicKey
  baseTokenName?: string
  uiPoolTokenAmount?: number
  uiMinimumTokenAmount?: number
}

export enum Instructions {
  Transfer,
  ProgramUpgrade,
  SetProgramAuthority,
  Mint,
  Base64,
  None,
  AddLiquidityRaydium,
  RemoveLiquidityRaydium,
  InitializeController,
  SetRedeemableGlobalSupplyCap,
  SetMangoDepositoriesRedeemableSoftCap,
  RegisterMangoDepository,
  DepositInsuranceToMangoDepository,
  WithdrawInsuranceFromMangoDepository,
  MangoMakeChangeMaxAccounts,
  MangoChangeReferralFeeParams,
  CreateAssociatedTokenAccount,
  CreateSolendObligationAccount,
  InitSolendObligationAccount,
  DepositReserveLiquidityAndObligationCollateral,
  WithdrawObligationCollateralAndRedeemReserveLiquidity,
  RefreshSolendObligation,
  RefreshSolendReserve,
  Grant,
  Clawback,
  TokenTransferBetweenInternalGovernanceAccounts,
  GovernanceUnderlyingTokenAccountTransfer,
  TribecaNewEscrow,
  TribecaLock,
  TribecaCreateEscrowSbrATA,
  TribecaCreateGaugeVoter,
  TribecaCreateGaugeVote,
  TribecaGaugeSetVote,
  TribecaPrepareEpochGaugeVoter,
  TribecaCreateEpochGauge,
  TribecaGaugeCommitVote,
  SoceanMintBondedTokens,
  SoceanDepositToAuctionPool,
  SoceanCloseAuction,
  SoceanPurchaseBondedTokens,
  SoceanCancelVest,
  SoceanVest,
  SaberPoolsDeposit,
  SaberPoolsWithdrawOne,
}

export interface InitializeControllerForm {
  governedAccount: GovernedProgramAccount | undefined
  mintDecimals: number
  programId: string | undefined
}

export interface SetRedeemableGlobalSupplyCapForm {
  governedAccount: GovernedProgramAccount | undefined
  supplyCap: number
  programId: string | undefined
}

export interface SetMangoDepositoriesRedeemableSoftCapForm {
  governedAccount: GovernedProgramAccount | undefined
  softCap: number
  programId: string | undefined
}

export interface RegisterMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  programId: string | undefined
}

export interface DepositInsuranceToMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  insuranceDepositedAmount: number
  programId: string | undefined
}

export interface WithdrawInsuranceFromMangoDepositoryForm {
  governedAccount: GovernedProgramAccount | undefined
  collateralName: string
  insuranceName: string
  insuranceWithdrawnAmount: number
  programId: string | undefined
}

export enum UXDIntructions {
  InitializeController,
  SetRedeemableGlobalSupplyCap,
  SetMangoDepositoriesRedeemableSoftCap,
  RegisterMangoDepository,
  DepositInsuranceToMangoDepository,
  WithdrawInsuranceFromMangoDepository,
  Grant,
  Clawback,
  CreateAssociatedTokenAccount,
  CreateSolendObligationAccount,
  InitSolendObligationAccount,
  DepositReserveLiquidityAndObligationCollateral,
  WithdrawObligationCollateralAndRedeemReserveLiquidity,
  RefreshSolendObligation,
  RefreshSolendReserve,
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
  isDraft: boolean
]

export interface ComponentInstructionData {
  governedAccount?: ProgramAccount<Governance> | undefined
  getInstruction?: () => Promise<UiInstruction>
  type: any
}
export interface InstructionsContext {
  instructionsData: ComponentInstructionData[]
  handleSetInstructions: (val, index) => void
  governance: ProgramAccount<Governance> | null | undefined
  setGovernance: (val) => void
}
