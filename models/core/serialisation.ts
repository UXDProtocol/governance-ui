import { AccountInfo, PublicKey } from '@solana/web3.js'
import { deserializeBorsh } from '../../utils/borsh'

import { Schema } from 'borsh'
import { ParsedAccountBase } from './accounts'

export function BorshAccountParser(
  classType: any,
  getSchema: (accountType: number) => Schema
): (pubKey: PublicKey, info: AccountInfo<Buffer>) => ParsedAccountBase {
  return (pubKey: PublicKey, info: AccountInfo<Buffer>) => {
    const buffer = Buffer.from(info.data)
    const data = deserializeBorsh(getSchema(info.data[0]), classType, buffer)

    return {
      pubkey: pubKey,
      account: {
        ...info,
      },
      info: data,
    } as ParsedAccountBase
  }
}
