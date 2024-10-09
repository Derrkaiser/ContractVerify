// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BasicToken is ERC20{
    string private _tokenName;
    string private _tokenSymbol;
    bool private initialized;

    // Constructor removed since we're using proxy setup
    constructor() ERC20("", "") {}

    // Initialize function to replace the constructor for proxy setup
    function initialize(string memory tokenName, string memory tokenSymbol, uint256 initialSupply) external {
        require(!initialized, "Already initialized");

        // Set the token name and symbol using local storage variables
        _tokenName = tokenName;
        _tokenSymbol = tokenSymbol;

        // Mint initial supply of tokens
        _mint(msg.sender, initialSupply);
        
        // Mark as initialized
        initialized = true;
    }

    // Override the name and symbol functions
    function name() public view override returns (string memory) {
        return _tokenName;
    }

    function symbol() public view override returns (string memory) {
        return _tokenSymbol;
    }

    // Test function remains as is
    function retrieve10() public view returns (uint256) {
        return 10;
    }
}
