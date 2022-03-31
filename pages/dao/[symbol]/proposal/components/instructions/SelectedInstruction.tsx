import { Governance, ProgramAccount } from '@solana/spl-governance'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import Clawback from 'VoteStakeRegistry/components/instructions/Clawback'
import Grant from 'VoteStakeRegistry/components/instructions/Grant'
import ProgramUpgrade from './bpfUpgradeableLoader/ProgramUpgrade'
import CreateAssociatedTokenAccount from './CreateAssociatedTokenAccount'
import CustomBase64 from './CustomBase64'
import Empty from './Empty'
import Mint from './Mint'
import RaydiumAddLiquidityToPool from './Raydium/AddLiquidityToPool'
import RaydiumRemoveLiquidityFromPool from './Raydium/RemoveLiquidityFromPool'
import SetProgramAuthority from './SetProgramAuthority'
import SplTokenTransfer from './SplTokenTransfer'
import SolendCreateObligationAccount from './Solend/CreateObligationAccount'
import SolendDepositReserveLiquidityAndObligationCollateral from './Solend/DepositReserveLiquidityAndObligationCollateral'
import SolendInitObligationAccount from './Solend/InitObligationAccount'
import SolendRefreshObligation from './Solend/RefreshObligation'
import SolendRefreshReserve from './Solend/RefreshReserve'
import SolendWithdrawObligationCollateralAndRedeemReserveLiquidity from './Solend/WithdrawObligationCollateralAndRedeemReserveLiquidity'
import UXDDepositInsuranceToMangoDepository from './UXD/DepositInsuranceToMangoDepository'
import UXDInitializeController from './UXD/InitializeController'
import UXDRegisterMangoDeposiory from './UXD/RegisterMangoDepository'
import UXDSetMangoDepositoriesRedeemableSoftCap from './UXD/SetMangoDepositoriesRedeemableSoftCap'
import UXDSetRedeemableGlobalSupplyCap from './UXD/SetRedeemGlobalSupplyCap'
import UXDWithdrawInsuranceFromMangoDepository from './UXD/WithdrawInsuranceFromMangoDepository'
import UXDStakingInitializeStakingCampaign from './UXDStaking/InitializeStakingCampaign'
import UXDStakingFinalizeStakingCampaign from './UXDStaking/FinalizeStakingCampaign'
import UXDStakingAddStakingOption from './UXDStaking/AddStakingOption'

const SelectedInstruction = ({
  itxType,
  index,
  governance,
  governedAccount,
}: {
  itxType: number
  index: number
  governance: ProgramAccount<Governance> | null
  governedAccount: GovernedMultiTypeAccount | undefined
}) => {
  switch (itxType) {
    case Instructions.Transfer:
      return <SplTokenTransfer index={index} governance={governance} />
    case Instructions.ProgramUpgrade:
      return <ProgramUpgrade index={index} governedAccount={governedAccount} />
    case Instructions.SetProgramAuthority:
      return (
        <SetProgramAuthority index={index} governedAccount={governedAccount} />
      )
    case Instructions.CreateAssociatedTokenAccount:
      return (
        <CreateAssociatedTokenAccount
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.SolendCreateObligationAccount:
      return (
        <SolendCreateObligationAccount
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.SolendInitObligationAccount:
      return (
        <SolendInitObligationAccount
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.SolendDepositReserveLiquidityAndObligationCollateral:
      return (
        <SolendDepositReserveLiquidityAndObligationCollateral
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.SolendRefreshObligation:
      return (
        <SolendRefreshObligation
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.SolendRefreshReserve:
      return (
        <SolendRefreshReserve index={index} governedAccount={governedAccount} />
      )
    case Instructions.SolendWithdrawObligationCollateralAndRedeemReserveLiquidity:
      return (
        <SolendWithdrawObligationCollateralAndRedeemReserveLiquidity
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.RaydiumAddLiquidity:
      return (
        <RaydiumAddLiquidityToPool
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.RaydiumRemoveLiquidity:
      return (
        <RaydiumRemoveLiquidityFromPool
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDInitializeController:
      return (
        <UXDInitializeController
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDSetRedeemableGlobalSupplyCap:
      return (
        <UXDSetRedeemableGlobalSupplyCap
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDSetMangoDepositoriesRedeemableSoftCap:
      return (
        <UXDSetMangoDepositoriesRedeemableSoftCap
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDRegisterMangoDepository:
      return (
        <UXDRegisterMangoDeposiory
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDDepositInsuranceToMangoDepository:
      return (
        <UXDDepositInsuranceToMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDWithdrawInsuranceFromMangoDepository:
      return (
        <UXDWithdrawInsuranceFromMangoDepository
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.Mint:
      return <Mint index={index} governance={governance} />
    case Instructions.Base64:
      return <CustomBase64 index={index} governance={governance} />
    case Instructions.None:
      return <Empty index={index} governedAccount={governedAccount} />
    case Instructions.Grant:
      return <Grant index={index} governance={governance} />
    case Instructions.Clawback:
      return <Clawback index={index} governance={governance} />
    case Instructions.UXDStakingInitializeStakingCampaign:
      return (
        <UXDStakingInitializeStakingCampaign
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDStakingFinalizeStakingCampaign:
      return (
        <UXDStakingFinalizeStakingCampaign
          index={index}
          governedAccount={governedAccount}
        />
      )
    case Instructions.UXDStakingAddStakingOption:
      return (
        <UXDStakingAddStakingOption
          index={index}
          governedAccount={governedAccount}
        />
      )
    default:
      return null
  }
}

export default SelectedInstruction
