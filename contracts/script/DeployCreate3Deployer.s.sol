// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";
import { Create3Deployer } from "../contracts/create3/Create3Deployer.sol";

contract DeployCreate3Deployer is Script {
    function run() public {
        vm.broadcast();
        new Create3Deployer();
    }
}