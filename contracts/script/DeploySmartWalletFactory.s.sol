// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";
import { SmartWalletFactory } from "../src/smartWallet/SmartWalletFactory.sol";

contract DeploySmartWalletFactory is Script {
    function run() external {
        vm.startBroadcast();
        
        // Deploy the SmartWalletFactory contract
        SmartWalletFactory factory = new SmartWalletFactory();
        
        vm.stopBroadcast();
        
        console.log("SmartWalletFactory deployed at:", address(factory));
    }
}
