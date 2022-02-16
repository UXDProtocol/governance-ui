import Select from '@components/inputs/Select'
import { OwnedTokenAccountInfos } from '@hooks/useGovernanceUnderlyingTokenAccounts'
import { PublicKey } from '@solana/web3.js'

const TokenAccountSelect = ({
  label,
  value,
  onChange,
  error,
  ownedTokenAccounts,
}: {
  label: string
  value?: string
  onChange: (value: PublicKey) => void
  error: string
  ownedTokenAccounts: OwnedTokenAccountInfos
}) => {
  const getAccountDisplay = (pubkey?: PublicKey) => {
    if (!pubkey) return <div></div>

    const {
      mint,
      uiAmount,
      mintName,
      isATA,
    } = ownedTokenAccounts!.find(({ pubkey: pk }) => pk.equals(pubkey!))!

    return (
      <>
        <div className="flex flex-col">
          <div className="mb-0.5">{pubkey.toString()}</div>

          <div className="flex flex-col">
            <div className="space-y-0.5 text-xs text-fgd-3">
              Mint Name: {mintName}
            </div>
            <div className="space-y-0.5 text-xs text-fgd-3">
              UI Balance: {uiAmount}
            </div>
            <div className="space-y-0.5 text-xs text-fgd-3 mb-0.5">
              Mint: {mint.toString()}
            </div>
            <div>
              {isATA ? (
                <span className="text-xs text-green">
                  Associated Token Account
                </span>
              ) : (
                <span className="text-xs text-red">
                  Not an Associated Token Account
                </span>
              )}
            </div>
          </div>
        </div>
      </>
    )
  }

  // ,

  return (
    <Select
      label={label}
      value={value}
      componentLabel={getAccountDisplay(
        value ? new PublicKey(value) : undefined
      )}
      placeholder="Please select..."
      onChange={onChange}
      error={error}
    >
      {ownedTokenAccounts.map(({ pubkey }) => (
        <Select.Option key={pubkey.toString()} value={pubkey}>
          {getAccountDisplay(pubkey)}
        </Select.Option>
      ))}
    </Select>
  )
}

export default TokenAccountSelect
