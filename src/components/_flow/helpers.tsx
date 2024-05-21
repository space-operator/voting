export function prepFlowInputs(inputs: any, wallet: any) {
    const walletPk = wallet.publicKey.toBase58();
    const jsonStr = JSON.stringify(inputs).replace(/WALLET/g, walletPk);
    console.log('flow inputs', jsonStr);
    return JSON.parse(jsonStr);
  }
  