import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function createGaugeVoterInstruction({
  programs,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  authority: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter, bump] = await tribecaConfiguration.findGaugeVoterAddress(
    escrow,
  );

  console.log('Create Gauge Voter', {
    escrow: escrow.toString(),
    gaugeVoter: gaugeVoter.toString(),
    gaugemeister: tribecaConfiguration.gaugemeister.toString(),
    payer: payer.toString(),
  });

  return programs.Gauge.instruction.createGaugeVoter(bump, {
    accounts: {
      gaugeVoter,
      gaugemeister: tribecaConfiguration.gaugemeister,
      escrow,
      payer,
      systemProgram: SystemProgram.programId,
    },
  });
}
