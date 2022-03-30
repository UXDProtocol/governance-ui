import { GovernanceAccountType } from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import {
  getMultipleAccountInfoChunked,
  GovernedMintInfoAccount,
  parseMintAccountData,
} from '@utils/tokens'
import { InstructionEnum } from '@utils/uiTypes/proposalCreationTypes'

import useWalletStore from 'stores/useWalletStore'

import useRealm from './useRealm'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'

export type InstructionType = {
  id: InstructionEnum
  name: string
  isVisible?: boolean
}

export default function useGovernanceAssets() {
  const { ownVoterWeight, realm, symbol, governances } = useRealm()
  const connection = useWalletStore((s) => s.connection.current)
  const governedTokenAccounts = useGovernanceAssetsStore(
    (s) => s.governedTokenAccounts
  )
  const governancesArray = useGovernanceAssetsStore((s) => s.governancesArray)

  const getGovernancesByAccountType = (type: GovernanceAccountType) => {
    const governancesFiltered = governancesArray.filter(
      (gov) => gov.account?.accountType === type
    )
    return governancesFiltered
  }

  const getGovernancesByAccountTypes = (types: GovernanceAccountType[]) => {
    const governancesFiltered = governancesArray.filter((gov) =>
      types.some((t) => gov.account?.accountType === t)
    )
    return governancesFiltered
  }

  function canUseGovernanceForInstruction(types: GovernanceAccountType[]) {
    return (
      realm &&
      getGovernancesByAccountTypes(types).some((govAcc) =>
        ownVoterWeight.canCreateProposal(govAcc.account.config)
      )
    )
  }
  const canMintRealmCommunityToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    return !!governances.find((govAcc) =>
      realm?.account.communityMint.equals(govAcc.account.governedAccount)
    )
  }
  const canMintRealmCouncilToken = () => {
    const governances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])

    return !!governances.find(
      (x) =>
        x.account.governedAccount.toBase58() ==
        realm?.account.config.councilMint?.toBase58()
    )
  }
  // TODO: Check governedAccounts from all governances plus search for token accounts owned by governances
  const canUseTransferInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.TokenGovernanceV1,
    GovernanceAccountType.TokenGovernanceV2,
  ])

  const canUseProgramUpgradeInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.ProgramGovernanceV1,
    GovernanceAccountType.ProgramGovernanceV2,
  ])

  const canUseMintInstruction = canUseGovernanceForInstruction([
    GovernanceAccountType.MintGovernanceV1,
    GovernanceAccountType.MintGovernanceV2,
  ])

  const canUseUxdInstructions =
    symbol === 'UXP' &&
    canUseGovernanceForInstruction([
      GovernanceAccountType.ProgramGovernanceV1,
      GovernanceAccountType.ProgramGovernanceV2,
    ])

  const canUseAnyInstruction =
    realm &&
    governancesArray.some((gov) =>
      ownVoterWeight.canCreateProposal(gov.account.config)
    )

  async function getMintWithGovernances() {
    const mintGovernances = getGovernancesByAccountTypes([
      GovernanceAccountType.MintGovernanceV1,
      GovernanceAccountType.MintGovernanceV2,
    ])
    const governedMintInfoAccounts: GovernedMintInfoAccount[] = []
    const mintGovernancesMintInfo = await getMultipleAccountInfoChunked(
      connection,
      mintGovernances.map((x) => x.account.governedAccount)
    )
    mintGovernancesMintInfo.forEach((mintAccountInfo, index) => {
      const governance = mintGovernances[index]
      if (!mintAccountInfo) {
        throw new Error(
          `Missing mintAccountInfo for: ${governance.pubkey.toBase58()}`
        )
      }
      const data = Buffer.from(mintAccountInfo.data)
      const parsedMintInfo = parseMintAccountData(data) as MintInfo
      const obj = {
        governance,
        mintInfo: parsedMintInfo,
      }
      governedMintInfoAccounts.push(obj)
    })
    return governedMintInfoAccounts
  }

  const governedTokenAccountsWithoutNfts = governedTokenAccounts.filter(
    (x) => !x.isNft
  )
  const nftsGovernedTokenAccounts = governedTokenAccounts.filter(
    (govTokenAcc) => govTokenAcc.isNft
  )
  const canUseTokenTransferInstruction = governedTokenAccountsWithoutNfts.some(
    (acc) =>
      acc.governance &&
      ownVoterWeight.canCreateProposal(acc.governance?.account?.config)
  )

  const instructions: InstructionType[] = [
    {
      id: InstructionEnum.TribecaCreateEpochGauge,
      name: 'Tribeca: Create Epoch Gauge',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaCreateEscrowGovernanceTokenATA,
      name: 'Tribeca: Create Escrow Governance Token ATA',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaCreateGaugeVote,
      name: 'Tribeca: Create Gauge Vote',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaCreateGaugeVoter,
      name: 'Tribeca: Create Gauge Voter',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaGaugeCommitVote,
      name: 'Tribeca: Gauge Commit Vote',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaGaugeRevertVote,
      name: 'Tribeca: Gauge Revert Vote',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaLock,
      name: 'Tribeca: Lock Tokens',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaNewEscrow,
      name: 'Tribeca: New Escrow',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaPrepareEpochGaugeVoter,
      name: 'Tribeca: Prepare Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaResetEpochGaugeVoter,
      name: 'Tribeca: Reset Epoch Gauge Voter',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.TribecaGaugeSetVote,
      name: 'Tribeca: Set Gauge Vote',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.SolendCreateObligationAccount,
      name: 'Solend: Create Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.SolendInitObligationAccount,
      name: 'Solend: Init Obligation Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.SolendDepositReserveLiquidityAndObligationCollateral,
      name: 'Solend: Deposit Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.SolendRefreshReserve,
      name: 'Solend: Refresh Reserve',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.SolendRefreshObligation,
      name: 'Solend: Refresh Obligation',
      isVisible: canUseAnyInstruction,
    },
    {
      id:
        InstructionEnum.SolendWithdrawObligationCollateralAndRedeemReserveLiquidity,
      name: 'Solend: Withdraw Funds',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.UXDInitializeController,
      name: 'UXD: Initialize Controller',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.UXDSetRedeemableGlobalSupplyCap,
      name: 'UXD: Set Redeemable Global Supply Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.UXDSetMangoDepositoriesRedeemableSoftCap,
      name: 'UXD: Set Mango Depositories Redeemable Supply Soft Cap',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.UXDRegisterMangoDepository,
      name: 'UXD: Register Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.UXDDepositInsuranceToMangoDepository,
      name: 'UXD: Deposit Insurance To Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.UXDWithdrawInsuranceFromMangoDepository,
      name: 'UXD: Withdraw Insurance From Mango Depository',
      isVisible: canUseUxdInstructions,
    },
    {
      id: InstructionEnum.RaydiumAddLiquidity,
      name: 'Raydium: Add To Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.RaydiumRemoveLiquidity,
      name: 'Raydium: Remove From Liquidity Pool',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.Transfer,
      name: 'Transfer Tokens',
      isVisible: canUseTokenTransferInstruction,
    },
    {
      id: InstructionEnum.Grant,
      name: 'Grant',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
    },
    {
      id: InstructionEnum.Clawback,
      name: 'Clawback',
      isVisible:
        canUseTokenTransferInstruction &&
        realm?.account.config.useCommunityVoterWeightAddin,
    },
    {
      id: InstructionEnum.CreateAssociatedTokenAccount,
      name: 'Create Associated Token Account',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.FriktionDepositIntoVolt,
      name: 'Friktion: Deposit into Volt',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.ProgramUpgrade,
      name: 'Upgrade Program',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: InstructionEnum.SetProgramAuthority,
      name: 'Set Program Authority',
      isVisible: canUseProgramUpgradeInstruction,
    },
    {
      id: InstructionEnum.Mint,
      name: 'Mint Tokens',
      isVisible: canUseMintInstruction,
    },
    {
      id: InstructionEnum.Base64,
      name: 'Execute Custom Instruction',
      isVisible: canUseAnyInstruction,
    },
    {
      id: InstructionEnum.None,
      name: 'None',
      isVisible:
        realm &&
        Object.values(governances).some((g) =>
          ownVoterWeight.canCreateProposal(g.account.config)
        ),
    },
  ]

  const availableInstructions = instructions.filter((itx) => itx.isVisible)

  return {
    governancesArray,
    getGovernancesByAccountType,
    getGovernancesByAccountTypes,
    availableInstructions,
    governedTokenAccounts,
    getMintWithGovernances,
    canUseTransferInstruction,
    canUseMintInstruction,
    canMintRealmCommunityToken,
    canMintRealmCouncilToken,
    canUseProgramUpgradeInstruction,
    governedTokenAccountsWithoutNfts,
    nftsGovernedTokenAccounts,
  }
}
