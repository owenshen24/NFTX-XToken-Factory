// SPDX-License-Identifier: MIT
pragma solidity 0.6.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";

contract XTokenClonable is Ownable, ERC20Burnable {

  bool initialized;

  // Note this is never used because we use initializer
  constructor() ERC20("", "") public {
    initialized = true;
  }

  function init(string memory name, string memory symbol, address _owner) public {
    require(!initialized, "Initialized");
    initialized = true;
    _mint(msg.sender, 0);
    _transferOwnership(_owner);
    _changeName(name);
    _changeSymbol(symbol);
    _setupDecimals(18);
  }

  function mint(address to, uint256 amount) public onlyOwner {
    _mint(to, amount);
  }

  function changeName(string memory name) public onlyOwner {
    _changeName(name);
  }

  function changeSymbol(string memory symbol) public onlyOwner {
    _changeSymbol(symbol);
  }
}