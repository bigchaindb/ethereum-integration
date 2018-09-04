pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract Token is StandardToken {
    
    string public name;
    string public symbol;
    uint8 public decimals = 0;
    uint public INITIAL_SUPPLY;

    constructor(string _name, string _symbol, uint _initialSupply) public {
        name = _name;
        symbol = _symbol; 
        INITIAL_SUPPLY = _initialSupply;
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
    }

}