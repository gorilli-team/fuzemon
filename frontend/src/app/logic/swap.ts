import { Address, Order, OrderData } from "@1inch/cross-chain-sdk";

export interface CreateOrderParams {
  maker: string;
  fromAmount: string;
  toAmount: string;
  fromTokenAddress: string;
  toTokenAddress: string;
  secret: string;
  fromChain: number;
  toChain: number;
  fromTokenDecimals: number;
  toTokenDecimals: number;
}

export const createOrder = async (params: CreateOrderParams) => {
  const {
    maker,
    fromAmount,
    toAmount,
    fromTokenAddress,
    toTokenAddress,
    secret,
    fromChain,
    toChain,
    fromTokenDecimals,
    toTokenDecimals,
  } = params;

  // Create order using 1inch SDK
  const order = Order.new({
    maker: new Address(maker),
    makerAsset: new Address(fromTokenAddress),
    takerAsset: new Address(toTokenAddress),
    makingAmount: BigInt(
      Math.floor(parseFloat(fromAmount) * Math.pow(10, fromTokenDecimals))
    ),
    takingAmount: BigInt(
      Math.floor(parseFloat(toAmount) * Math.pow(10, toTokenDecimals))
    ),
    receiver: new Address(maker),
    allowedSender: new Address("0x0000000000000000000000000000000000000000"),
    expiration: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
    salt: BigInt(Math.floor(Math.random() * 1000000)),
  });

  // Create order data for signing
  const orderdata: OrderData = {
    domain: {
      name: "1inch Limit Order Protocol",
      version: "2",
      chainId: fromChain,
      verifyingContract: "0x0000000000000000000000000000000000000000", // Replace with actual contract
    },
    types: {
      Order: [
        { name: "maker", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "receiver", type: "address" },
        { name: "allowedSender", type: "address" },
        { name: "expiration", type: "uint256" },
        { name: "salt", type: "uint256" },
      ],
    },
    primaryType: "Order",
    message: {
      maker,
      makerAsset: fromTokenAddress,
      takerAsset: toTokenAddress,
      makingAmount: order.makingAmount.toString(),
      takingAmount: order.takingAmount.toString(),
      receiver: maker,
      allowedSender: "0x0000000000000000000000000000000000000000",
      expiration: order.expiration.toString(),
      salt: order.salt.toString(),
    },
  };

  return {
    order,
    orderdata,
  };
};
