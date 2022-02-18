import { GovernedTokenAccount } from '@utils/tokens'
import useWalletStore from '../../stores/useWalletStore'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { getTreasuryAccountItemInfo } from '@utils/treasuryTools'
import useGovernanceUnderlyingTokenAccounts from '@hooks/useGovernanceUnderlyingTokenAccounts'
import { abbreviateAddress } from '@utils/formatting'
import { getExplorerUrl } from '@components/explorer/tools'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { createRef } from 'react'

const AccountItem = ({
  governedAccountTokenAccount,
}: {
  governedAccountTokenAccount: GovernedTokenAccount
}) => {
  const governanceNfts = useTreasuryAccountStore((s) => s.governanceNfts)

  const {
    amountFormatted,
    logo,
    name,
    symbol,
    displayPrice,
    isSol,
  } = getTreasuryAccountItemInfo(governedAccountTokenAccount, governanceNfts)

  const {
    setCurrentCompactView,
    setCurrentCompactAccount,
  } = useTreasuryAccountStore()

  const connection = useWalletStore((s) => s.connection)

  async function handleGoToAccountOverview() {
    setCurrentCompactView(ViewState.AccountView)
    setCurrentCompactAccount(governedAccountTokenAccount, connection)
  }

  const { ownedTokenAccountsInfo } = useGovernanceUnderlyingTokenAccounts(
    governedAccountTokenAccount.governance?.pubkey
  )

  return (
    <div className="cursor-pointer default-transition flex flex-col items-start text-fgd-1 border border-fgd-4 rounded-lg w-full">
      <div
        className="flex items-start text-fgd-1 hover:bg-bkg-3 p-3 w-full"
        onClick={handleGoToAccountOverview}
      >
        {logo && (
          <img
            className={`flex-shrink-0 h-6 w-6 mr-2.5 mt-1 ${
              isSol && 'rounded-full'
            }`}
            src={logo}
          />
        )}

        <div className="w-full">
          <div className="flex items-start justify-between mb-1">
            <div className="text-xs text-th-fgd-1">{name}</div>
          </div>
          <div className="text-fgd-3 text-xs flex flex-col">
            {amountFormatted} {symbol}
          </div>
          {displayPrice ? (
            <div className="mt-0.5 text-fgd-3 text-xs">${displayPrice}</div>
          ) : (
            ''
          )}
        </div>
      </div>

      {Object.values(ownedTokenAccountsInfo || {}).map(
        ({ pubkey, mintName, uiAmount, isATA }) => {
          const linkRef = createRef<HTMLAnchorElement>()

          return (
            <div
              key={pubkey.toString()}
              className="flex border-t border-gray-500 w-full hover:bg-bkg-3 p-3"
              onClick={() => linkRef.current?.click()}
            >
              <div className="flex flex-col">
                <div className="mt-0.5 text-xs">
                  {abbreviateAddress(pubkey)}
                </div>

                <div className="mt-0.5 flex text-xs text-fgd-3">
                  {uiAmount.toLocaleString()} {mintName}
                </div>
              </div>

              <div className="flex ml-10">
                {isATA ? (
                  <div className="flex justify-center items-center text-green h-5 w-50 text-xs p-1">
                    Associated Token Account
                  </div>
                ) : null}
              </div>

              <a
                className="ml-auto"
                href={getExplorerUrl(connection.endpoint, pubkey)}
                ref={linkRef}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
              </a>
            </div>
          )
        }
      )}
    </div>
  )
}

export default AccountItem
