import useHotWallet from '@hooks/useHotWallet'
import HotWalletAccount from './HotWalletAccount'
import { FireIcon } from '@heroicons/react/outline'
import HotWalletName from './HotWalletName'

const HotWallet = () => {
  const { tokenAccountsInfo, hotWalletInfo } = useHotWallet()

  if (!hotWalletInfo) {
    return <></>
  }

  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg transition-all">
      <h3 className="bg-bkg-2 mb-4 flex items-center">
        <FireIcon className="flex-shrink-0 h-5 mr-1 text-primary-light w-5" />
        Hot Wallet
      </h3>

      <HotWalletName
        hotWalletAddress={hotWalletInfo.publicKey}
        hotWalletName={hotWalletInfo.name}
      />

      <div style={{ maxHeight: '350px' }} className="overflow-y-auto space-y-3">
        {tokenAccountsInfo?.map((tokenAccountInfo) => (
          <HotWalletAccount
            key={tokenAccountInfo.publicKey.toBase58()}
            info={tokenAccountInfo}
          />
        ))}
      </div>
    </div>
  )
}

export default HotWallet
