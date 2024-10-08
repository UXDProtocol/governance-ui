import { PublicKey } from "@solana/web3.js";

export function getRealmPda(
    programId: PublicKey,
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('realm')],
        programId
    )[0]
}

export function getRealmUsdcPda(
    realmPda: PublicKey,
    programId: PublicKey,
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('realm_usdc'), realmPda.toBuffer()],
        programId
    )[0]
}

export function getUtcMint(
    realmPda: PublicKey,
    programId: PublicKey,
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [Buffer.from('uct_mint'), realmPda.toBuffer()],
        programId
    )[0]
}

