// contracts/CustomProxyAdmin.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title CustomProxyAdmin
 * @dev This contract is an owner-controlled contract that acts as the admin for a TransparentUpgradeableProxy.
 * The initial owner is set to the deployer (msg.sender).
 */
contract CustomProxyAdmin is ProxyAdmin {
    /**
     * @dev Initializes the admin contract with the deployer as the owner.
     */
    constructor() ProxyAdmin(msg.sender) {
        // ProxyAdmin constructor now expects the initialOwner as an argument
        // msg.sender is passed to Ownable, which will set the deployer as the owner
    }

    
    // Function to test verification
    function retrieve2() public view returns (uint256) {
        return 1;
    }
}
