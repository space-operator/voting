import { PluginName } from '@/constants/plugins';
import { PublicKey } from '@solana/web3.js';

export const getRegistrarPDA = (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey,
  pluginName?: PluginName
) => {
  const PLUGIN_NAME_SEEDS = {
    VSR: [realmPk.toBuffer(), Buffer.from('registrar'), mint.toBuffer()],
  };
  const seed = (pluginName && PLUGIN_NAME_SEEDS[pluginName]) ?? [
    Buffer.from('registrar'),
    realmPk.toBuffer(),
    mint.toBuffer(),
  ];
  const [registrar, registrarBump] = PublicKey.findProgramAddressSync(
    seed,
    clientProgramId
  );
  return {
    registrar,
    registrarBump,
  };
};
