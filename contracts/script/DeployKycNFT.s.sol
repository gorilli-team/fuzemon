// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Script } from "forge-std/Script.sol";
import { KycNFT } from "../contracts/kycNft/KycNFT.sol";

contract DeployKycNft is Script {
    function run() public {
        vm.broadcast();
        new KycNFT("Resolver Access Token", "RES", msg.sender);
    }
}