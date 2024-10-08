import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { useEffect, useState } from "react"
import { PublicKey } from '@solana/web3.js';
import { IDL } from '../idls/uxd';
import type { Uxd } from '../idls/uxd';
import useWalletOnePointOh from "./useWalletOnePointOh";
import useLegacyConnectionContext from "./useLegacyConnectionContext";


export default function useUXDProgram({
  programId,
}: {
  programId: PublicKey | null
}) {
  const connection = useLegacyConnectionContext()
  const wallet = useWalletOnePointOh()
  const [program, setProgram] = useState<Program<Uxd> | null>(null)

  useEffect(() => {
    if (!programId) return;

    const program = new Program<Uxd>(IDL, programId, new AnchorProvider(
      connection.current,
      wallet as any,
      AnchorProvider.defaultOptions()
    ));

    setProgram(program)
  }, [connection, programId, wallet])

  return program
}
