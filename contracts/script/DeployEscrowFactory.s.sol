// SPDX-License-Identifier: MIT

pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";

import { ICreate3Deployer } from "solidity-utils/contracts/interfaces/ICreate3Deployer.sol";

import { EscrowFactory } from "contracts/EscrowFactory.sol";

// solhint-disable no-console
import { console } from "forge-std/console.sol";

contract DeployEscrowFactory is Script {
    uint32 public constant RESCUE_DELAY = 691200; // 8 days
    bytes32 public constant CROSSCHAIN_SALT = keccak256("1inch EscrowFactory");
    
    address public constant LOP_SEPOLIA = 0x111111125421cA6dc452d289314280a0f8842A65;
    address public constant LOP_MONAD = 0xCAEa711010565904d3427b74794e3F36c191a6e7;
    address public constant ACCESS_TOKEN = 0x910A8b14d0CF4bD2Adc124EFC037afbAF864089c;
    address public constant CREATE3_DEPLOYER_SEPOLIA = 0x31Da4fDb1ecd1fce109C2523bb58B60eBb9BfB64;
    address public constant CREATE3_DEPLOYER_MONAD = 0xbbD86BB0Eedd3a5ab50d58af7FF7E1ad5304CA4A;
    ICreate3Deployer public constant CREATE3_DEPLOYER = ICreate3Deployer(CREATE3_DEPLOYER_MONAD);

    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        address owner = deployer;

        vm.startBroadcast();
        address escrowFactory = CREATE3_DEPLOYER.deploy(
            CROSSCHAIN_SALT,
            abi.encodePacked(
                type(EscrowFactory).creationCode,
                abi.encode(LOP_MONAD, ACCESS_TOKEN, owner, RESCUE_DELAY, RESCUE_DELAY)
            )
        );
        vm.stopBroadcast();

        console.log("Escrow Factory deployed at: ", escrowFactory);
    }
}
// solhint-enable no-console
