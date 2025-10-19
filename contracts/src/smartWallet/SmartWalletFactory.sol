// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { SmartWallet } from "./SmartWallet.sol";

/**
 * @title SmartWalletFactory
 * @notice Factory contract for deploying SmartWallet instances
 */
contract SmartWalletFactory is Ownable {
    // Array to store all deployed smart wallets
    address[] public s_deployedSmartWallets;
    
    // Mapping from user to their smart wallets
    mapping(address => address[]) public userSmartWallets;
    
    // Events
    event SmartWalletCreated(address indexed user, address indexed smartWallet);
    event SmartWalletFactory__WalletLimitExceeded(address indexed user, uint256 limit);
    
    // Errors
    error SmartWalletFactory__WalletLimitExceeded();
    error SmartWalletFactory__InvalidAddress();
    
    // Constants
    uint256 public constant MAX_WALLETS_PER_USER = 5;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Create a new smart wallet for the caller
     * @param usdc The USDC token address
     * @param router The universal router address
     * @param poolManager The pool manager address
     * @param permit2 The permit2 address
     * @return The address of the created smart wallet
     */
    function createSmartWallet(
        address usdc,
        address router,
        address poolManager,
        address permit2
    ) external returns (address) {
        if (usdc == address(0) || router == address(0) || poolManager == address(0) || permit2 == address(0)) {
            revert SmartWalletFactory__InvalidAddress();
        }
        
        // Check if user has reached the maximum number of wallets
        if (userSmartWallets[msg.sender].length >= MAX_WALLETS_PER_USER) {
            emit SmartWalletFactory__WalletLimitExceeded(msg.sender, MAX_WALLETS_PER_USER);
            revert SmartWalletFactory__WalletLimitExceeded();
        }
        
        // Deploy new smart wallet
        SmartWallet smartWallet = new SmartWallet(
            msg.sender,
            usdc,
            router,
            poolManager,
            permit2
        );
        
        address walletAddress = address(smartWallet);
        
        // Store the smart wallet
        s_deployedSmartWallets.push(walletAddress);
        userSmartWallets[msg.sender].push(walletAddress);
        
        // Emit event
        emit SmartWalletCreated(msg.sender, walletAddress);
        
        return walletAddress;
    }
    
    /**
     * @notice Get the total number of deployed smart wallets
     * @return The total count
     */
    function getTotalDeployedSmartWallets() external view returns (uint256) {
        return s_deployedSmartWallets.length;
    }
    
    /**
     * @notice Get all smart wallets for a specific user
     * @param user The user address
     * @return Array of smart wallet addresses
     */
    function getUserSmartWallets(address user) external view returns (address[] memory) {
        return userSmartWallets[user];
    }
    
    /**
     * @notice Get a specific smart wallet for a user by index
     * @param user The user address
     * @param index The index of the smart wallet
     * @return The smart wallet address
     */
    function getUserSmartWallet(address user, uint256 index) external view returns (address) {
        require(index < userSmartWallets[user].length, "Index out of bounds");
        return userSmartWallets[user][index];
    }
    
    /**
     * @notice Get the number of smart wallets for a specific user
     * @param user The user address
     * @return The count of smart wallets
     */
    function getUserSmartWalletCount(address user) external view returns (uint256) {
        return userSmartWallets[user].length;
    }
}
