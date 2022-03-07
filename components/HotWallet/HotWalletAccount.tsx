import BigNumber from 'bignumber.js'
import { abbreviateAddress } from '@utils/formatting'
import { HotWalletAccountInfo } from '@hooks/useHotWallet'
import { getExplorerUrl } from '@components/explorer/tools'
import useWalletStore from 'stores/useWalletStore'
import { createRef } from 'react'
import { ExternalLinkIcon } from '@heroicons/react/outline'

const HotWalletAccount = ({ info }: { info: HotWalletAccountInfo }) => {
  const connection = useWalletStore((store) => store.connection)

  const linkRef = createRef<HTMLAnchorElement>()

  const amountFormatted = Number(
    new BigNumber(info.amount.toNumber()).shiftedBy(-info.decimals).toString()
  ).toLocaleString()

  const usdTotalValueFormatted = Number(
    new BigNumber(info.usdTotalValue.toNumber())
      .shiftedBy(-info.decimals)
      .toString()
  ).toLocaleString()

  return (
    <div
      className="flex flex-col items-start text-fgd-1 hover:bg-bkg-3 p-3 w-full cursor-pointer border border-fgd-4 rounded-lg relative"
      onClick={() => linkRef.current?.click()}
    >
      <span className="text-xs text-th-fgd-1">
        {abbreviateAddress(info.publicKey)}
      </span>

      <span className="text-fgd-3 text-xs flex flex-col">
        {amountFormatted} {info.mintName ?? abbreviateAddress(info.mint)}
      </span>

      <span className="text-fgd-3 text-xs">${usdTotalValueFormatted}</span>

      <a
        className="absolute right-3"
        href={getExplorerUrl(connection.endpoint, info.publicKey)}
        ref={linkRef}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
      </a>
    </div>
  )
}

export default HotWalletAccount
