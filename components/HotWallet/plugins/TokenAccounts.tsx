import { BookOpenIcon } from '@heroicons/react/outline'
import { HotWalletAccount } from '@hooks/useHotWallet'
import useHotWalletPluginTokenAccounts from '@hooks/useHotWalletPluginTokenAccounts'
import TokenAccount from './TokenAccount'

const HotWalletPluginTokenAccounts = ({
  hotWalletAccount,
}: {
  hotWalletAccount: HotWalletAccount
}) => {
  const { tokenAccounts } = useHotWalletPluginTokenAccounts(hotWalletAccount)

  if (!hotWalletAccount) {
    return <></>
  }

  return (
    <div className="bg-bkg-2">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <BookOpenIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Token Accounts
      </h3>

      <div style={{ maxHeight: '350px' }} className="overflow-y-auto space-y-3">
        {tokenAccounts?.map((tokenAccount) => (
          <TokenAccount
            key={tokenAccount.publicKey.toBase58()}
            info={tokenAccount}
          />
        ))}
      </div>
    </div>
  )
}

export default HotWalletPluginTokenAccounts
