import { CHAINS } from "../constants/chains";

export const getTransactionLink = (chainId: number, txHash: string): string => {
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  return `${chain.blockExplorer}/tx/${txHash}`;
};

export const getBlockExplorerLink = (
  chainId: number,
  blockHash: string
): string => {
  const chain = CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    return `https://etherscan.io/block/${blockHash}`;
  }
  return `${chain.blockExplorer}/block/${blockHash}`;
};
