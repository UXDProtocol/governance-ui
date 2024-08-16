import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { useEffect, useState } from "react"
import { PublicKey } from '@solana/web3.js';
import { IDL } from '../idls/redemption';
import type { Redemption } from '../idls/redemption';
import useWalletOnePointOh from "./useWalletOnePointOh";
import useLegacyConnectionContext from "./useLegacyConnectionContext";


export default function useUXDRedemptionProgram({
  programId,
}: {
  programId: PublicKey | null
}) {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const [program, setProgram] = useState<Program<Redemption> | null>(null)

  useEffect(() => {
    if (!programId) return;

    const program = new Program<Redemption>(IDL, programId, new AnchorProvider(
      connection.current,
      wallet as any,
      AnchorProvider.defaultOptions()
    ));

    setProgram(program)
  }, [connection, programId, wallet])

  return program
}
