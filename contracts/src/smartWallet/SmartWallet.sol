// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SmartWallet
 * @notice Smart wallet contract for automated trading
 */
contract SmartWallet is Ownable {
    using SafeERC20 for IERC20;
    
    // State variables
    address public immutable i_owner;
    address public immutable i_usdc;
    address public immutable i_router;
    address public immutable i_poolManager;
    address public immutable i_permit2;
    
    // Events
    event USDCDeposited(address indexed user, uint256 amount);
    event USDCWithdrawn(address indexed user, uint256 amount);
    event TokensBought(address indexed token, uint256 amountIn, uint256 amountOut);
    event TokensSold(address indexed token, uint256 amountIn, uint256 amountOut);
    
    // Errors
    error SmartWallet__Unauthorized();
    error SmartWallet__InsufficientBalance();
    error SmartWallet__InvalidAmount();
    error SmartWallet__TransferFailed();
    
    constructor(
        address owner,
        address usdc,
        address router,
        address poolManager,
        address permit2
    ) Ownable(owner) {
        i_owner = owner;
        i_usdc = usdc;
        i_router = router;
        i_poolManager = poolManager;
        i_permit2 = permit2;
    }
    
    /**
     * @notice Deposit USDC to the smart wallet
     * @param amount The amount of USDC to deposit
     */
    function depositUSDC(uint256 amount) external {
        if (amount == 0) {
            revert SmartWallet__InvalidAmount();
        }
        
        IERC20 usdc = IERC20(i_usdc);
        
        // Transfer USDC from user to this contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        
        emit USDCDeposited(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw USDC from the smart wallet
     * @param amount The amount of USDC to withdraw
     */
    function withdrawUSDC(uint256 amount) external {
        if (amount == 0) {
            revert SmartWallet__InvalidAmount();
        }
        
        IERC20 usdc = IERC20(i_usdc);
        
        if (usdc.balanceOf(address(this)) < amount) {
            revert SmartWallet__InsufficientBalance();
        }
        
        // Transfer USDC to user
        usdc.safeTransfer(msg.sender, amount);
        
        emit USDCWithdrawn(msg.sender, amount);
    }
    
    /**
     * @notice Buy tokens using USDC (placeholder implementation)
     * @param tokenOut The token to buy
     * @param amountOut The amount of tokens to buy
     * @param amountInMax The maximum amount of USDC to spend
     */
    function buyTokens(
        address tokenOut,
        uint256 amountOut,
        uint256 amountInMax
    ) external {
        // This is a placeholder implementation
        // In a real implementation, this would interact with Uniswap V4
        // For now, we'll just emit an event
        emit TokensBought(tokenOut, amountInMax, amountOut);
    }
    
    /**
     * @notice Sell tokens for USDC (placeholder implementation)
     * @param tokenIn The token to sell
     * @param amountIn The amount of tokens to sell
     * @param amountOutMin The minimum amount of USDC to receive
     */
    function sellTokens(
        address tokenIn,
        uint256 amountIn,
        uint256 amountOutMin
    ) external {
        // This is a placeholder implementation
        // In a real implementation, this would interact with Uniswap V4
        // For now, we'll just emit an event
        emit TokensSold(tokenIn, amountIn, amountOutMin);
    }
    
    /**
     * @notice Get the USDC balance of this smart wallet
     * @return The USDC balance
     */
    function getUSDCBalance() external view returns (uint256) {
        return IERC20(i_usdc).balanceOf(address(this));
    }
    
    /**
     * @notice Get the balance of any ERC20 token
     * @param token The token address
     * @return The token balance
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
    
    /**
     * @notice Emergency function to withdraw any ERC20 token
     * @param token The token address
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }
}
