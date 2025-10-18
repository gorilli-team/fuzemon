// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";
import { AggregationRouterV6 } from "contracts/aggregationRouterV6/AggregationRouterV6.sol";
import { IWETH } from "contracts/aggregationRouterV6/AggregationRouterV6.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployAggregationRouterV6 is Script {
    address public constant WETH_MONAD = 0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37;

    function run() public {
        vm.broadcast();
        new AggregationRouterV6(IWETH(WETH_MONAD));
    }
}