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

    struct userStats {
        uint256 usedFaucet;
        uint256 donated;
        uint256 nftsMinted;
        uint256 mintCooldown;
        uint256 faucetCooldown;
    }

    mapping(uint256 => NFTToken) tokens;
    mapping(address => userStats) public userStatsMap;

    constructor () ERC721("SunrisePubNFT", "RISE") {
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
        require(userStatsMap[msg.sender].mintCooldown < block.timestamp, "Wait more before minting another NFT");
        _safeMint(msg.sender, currentID);
        tokens[currentID] = NFTToken(currentID, _uri);
        currentID++;
        userStatsMap[msg.sender].mintCooldown = block.timestamp + 1 days;
        userStatsMap[msg.sender].nftsMinted++;
    }

    function burnNFT(uint256 id) public {
        require(msg.sender == ownerOf(id), "Not your NFT");
        _burn(id);
    }

    function balance() public view returns(uint256) {
        return address(this).balance;
    }

    function faucet() public {
        require(userStatsMap[msg.sender].faucetCooldown < block.timestamp, "Wait for longer before getting more MATIC");
        userStatsMap[msg.sender].faucetCooldown = block.timestamp + 12 hours;
        userStatsMap[msg.sender].usedFaucet++;
        payable(msg.sender).transfer(0.25 ether);
    }

    function donate() public payable returns(bool) {
        userStatsMap[msg.sender].donated += msg.value;
        return true;
    }

    function withdrawAll() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }

    function resetMetadata(string memory newUrl, uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        tokens[tokenId].metadataURI = newUrl;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    } 
}