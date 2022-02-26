pragma solidity ^0.8.0;

/*SPDX-License-Identifier: MIT*/

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol"; //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol

contract SunriseMain is ERC721{
    address public owner;
    uint256 private currentID;

    struct NFTToken {
        uint256 nftId;
        string metadataURI;
    }

    mapping(uint256 => NFTToken) tokens;
    mapping(address => uint256) mintCooldown;
    mapping(address => uint256) faucetCooldown;

    constructor () ERC721("SunrisePubNFT", "RISE"){
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner of the contract can call this");
        _;
    }

    function selfDestruct() public onlyOwner {
        selfdestruct(payable(owner));
    }

    function tokenURI(uint256 nftId) public view override returns (string memory) {
        require(_exists(nftId), "ERC721Metadata: URI query for nonexistent token");
        return tokens[nftId].metadataURI;
    }

    function mintNFT(string memory _uri) public {
        require(mintCooldown[msg.sender] < block.timestamp, "Wait more before minting another NFT");
        _safeMint(msg.sender, currentID);
        tokens[currentID] = NFTToken(currentID, _uri);
        currentID++;
        mintCooldown[msg.sender] = block.timestamp + 1 days;
    }

    function burnNFT(uint256 id) public {
        require(msg.sender == ownerOf(id), "Not your NFT");
        _burn(id);
    }

    function balance() public view returns(uint256) {
        return address(this).balance;
    }

    function faucet() public {
        require(faucetCooldown[msg.sender] < block.timestamp, "Wait for longer before getting more MATIC");
        faucetCooldown[msg.sender] = block.timestamp + 12 hours;
        payable(msg.sender).transfer(0.25 ether);
    }

    function donate() public payable returns(bool) {
        return true;
    }

    function withdrawAll() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    } 
}