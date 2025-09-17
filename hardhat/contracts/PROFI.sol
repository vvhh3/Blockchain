// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

contract PROFI is ERC20,ERC20Votes,ERC20Permit{//СИСТЕМНЫЙ ТОКЕН

    constructor() ERC20("Profesional", "PROFI") ERC20Permit("Profesional"){
        _mint(msg.sender,100000 *10 **decimals());
        _transfer(msg.sender,0x70997970C51812dc3A010C7d01b50e0d17dc79C8,25000 *10 **decimals());
        _transfer(msg.sender,0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC,25000 *10 **decimals());
        _transfer(msg.sender,0x90F79bf6EB2c4f870365E785982E1f101E93b906,25000 *10 **decimals());
    }
    function transferFrom(address from,address to,uint256 value)public override returns(bool){
        _transfer(from,to,value);
        return true;
    }   

    function decimals() public pure  override returns (uint8)  {
        return 12;
    }
    function _update(address from,address to,uint256 value)internal  virtual override(ERC20,ERC20Votes) {
        super._update(from, to, value);
    }
    function nonces (address owner) public view virtual override(ERC20Permit,Nonces) returns (uint256){
        super.nonces(owner);
    }
}