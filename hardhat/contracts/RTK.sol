// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract RTK is ERC20, ERC20Votes, ERC20Permit("RTCCoin") {  //WRAP-Token
    constructor() ERC20("RTCCoin", "RTK"){
        _mint(msg.sender, 20000000 * 10 **decimals());
    }

    function transferFrom(address from ,address to,uint value) public override returns(bool) {
        _transfer(from,to,value);
        return true;
    }
    function decimals() public pure override returns (uint8){
        return 12;
    }

    function buyToken() public payable {
        require(msg.value >=1);
        uint tokenAmount = (msg.value / 1 ether * 10 ** decimals());
        _transfer(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266,msg.sender,tokenAmount);
    }

    function _update(address from,address to,uint value)internal virtual override(ERC20, ERC20Votes) {
        super._update(from, to, value);
    }
    function nonces(address owner)  public view virtual override(ERC20Permit, Nonces) returns(uint256) {
        super.nonces(owner);
    }
}