// contracts/CustomProxy.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/**
 * @title CustomProxy
 * @dev This contract is a simple wrapper around the OpenZeppelin TransparentUpgradeableProxy contract.
 */
contract CustomProxy is TransparentUpgradeableProxy {
    /**
     * @dev Initializes an upgradeable proxy managed by `admin_`, backed by the implementation at `logic_`, and
     * optionally initialized with `data` as explained in {TransparentUpgradeableProxy-constructor}.
     * 
     * @param logic_ The address of the initial implementation.
     * @param admin_ The address of the admin, which can upgrade the proxy.
     * @param data_ Optional initialization data.
     */
    constructor(address logic_, address admin_, bytes memory data_) 
        TransparentUpgradeableProxy(logic_, admin_, data_) 
    {
        // You can add custom logic here, if necessary
    }

    // Function to test verification
    function retrieve3() public view returns (uint256) {
        return 2;
    }
}
