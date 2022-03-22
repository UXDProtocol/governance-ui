import BigNumber from 'bignumber.js'
import { abbreviateAddress } from '@utils/formatting'
import { HotWalletTokenAccounts } from '@hooks/useHotWalletPluginTokenAccounts'
import { getExplorerUrl } from '@components/explorer/tools'
import useWalletStore from 'stores/useWalletStore'
import { createRef } from 'react'
import { ExternalLinkIcon } from '@heroicons/react/outline'

const TokenAccount = ({ info }: { info: HotWalletTokenAccounts[0] }) => {
  const connection = useWalletStore((store) => store.connection)

  const linkRef = createRef<HTMLAnchorElement>()

  const amountFormatted = Number(
    new BigNumber(info.amount.toNumber()).shiftedBy(-info.decimals).toString()
  ).toLocaleString()

  const usdTotalValueFormatted = info.usdTotalValue.isZero()
    ? ''
    : `$${Number(
        new BigNumber(info.usdTotalValue.toNumber())
          .shiftedBy(-info.decimals)
          .toString()
      ).toLocaleString()}`

  return (
    <div
      className="flex flex-col items-start text-fgd-1 hover:bg-bkg-3 w-full cursor-pointer relative"
      onClick={() => linkRef.current?.click()}
    >
      <span className="flex content-center text-sm flex">
        {amountFormatted} {info.mintName ?? abbreviateAddress(info.mint)}
      </span>

      <span className="text-fgd-3 text-xs">{usdTotalValueFormatted}</span>

      <a
        className="absolute right-3 flex"
        href={getExplorerUrl(connection.endpoint, info.publicKey)}
        ref={linkRef}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs text-fgd-3 flex items-center ml-3">
          {abbreviateAddress(info.publicKey)}
        </span>
        <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
      </a>
    </div>
  )
}

export default TokenAccount
