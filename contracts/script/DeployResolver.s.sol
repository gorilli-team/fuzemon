// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";
import { Resolver } from "contracts/resolver/Resolver.sol";
import { IEscrowFactory } from "contracts/lib/cross-chain-swap/contracts/interfaces/IEscrowFactory.sol";
import { IOrderMixin } from "limit-order-protocol/contracts/interfaces/IOrderMixin.sol";

contract DeployResolver is Script {
    address public constant ESCROW_FACTORY_SEPOLIA = 0xF11B79631d6C74Ef2e3142D20B37Ded4f5F5B324;
    address public constant ESCROW_FACTORY_MONAD = 0xF11B79631d6C74Ef2e3142D20B37Ded4f5F5B324;
    address public constant LOP_SEPOLIA = 0x111111125421cA6dc452d289314280a0f8842A65;
    address public constant LOP_MONAD = 0xCAEa711010565904d3427b74794e3F36c191a6e7;

    function run() public {
        vm.broadcast();
        new Resolver(IEscrowFactory(ESCROW_FACTORY_MONAD), IOrderMixin(LOP_MONAD), msg.sender);
    }
}