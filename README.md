
<h1 align="center">
  <br>
  <br>
  Fuzemon
  <br>
</h1>

<h4 align="center">1inch Fusion+ integration with Monad Testnet.</h4>

## Approach
We wanted to add support for Monad Testnet to 1inch Fusion+. To do that, we first recreated the contracts architecture by deploying the `AggregationRouterV6`, `EscrowFactory` and `Resolver` contracts on both Ethereum Sepolia and Monad Testnet. Here are the deployed addresses:

Ethereum Sepolia:
- AggregationRouterV6: [0x111111125421cA6dc452d289314280a0f8842A65](https://sepolia.etherscan.io/address/0x111111125421cA6dc452d289314280a0f8842A65#code)
- EscrowFactory: [0xf11b79631d6c74ef2e3142d20b37ded4f5f5b324](https://sepolia.etherscan.io/address/0xf11b79631d6c74ef2e3142d20b37ded4f5f5b324#code)
- Resolver: [0x358Ea7c8EF1Bd0922cAE6C41ea1c8a8Ea2d754Cd](https://sepolia.etherscan.io/address/0x358Ea7c8EF1Bd0922cAE6C41ea1c8a8Ea2d754Cd#code)

Monad Testnet:
- AggregationRouterV6: [0xCAEa711010565904d3427b74794e3F36c191a6e7](https://testnet.monadexplorer.com/address/0xCAEa711010565904d3427b74794e3F36c191a6e7)
- EscrowFactory: [0x65c169Cef9904499788FE61ea708EB6F99C34Ff6](https://testnet.monadexplorer.com/address/0x65c169Cef9904499788FE61ea708EB6F99C34Ff6)
- Resolver: [0xb0CC0006662f91f7cEEf48eE444330f1B7A67D35](https://testnet.monadexplorer.com/address/0xb0CC0006662f91f7cEEf48eE444330f1B7A67D35)