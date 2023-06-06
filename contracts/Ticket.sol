// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Author: @vitor.furio
contract Ticket is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string inicialImage = "ipfs://ImagemInicial";
    string normalImage1 = "ipfs://ImagemNormal1";
    string normalImage2 = "ipfs://ImagemNormal2";
    string rareImage1 = "ipfs://ImagemRara1";
    string rareImage2 = "ipfs://ImagemRara2";
    string superRareImage = "ipfs://ImagemSuperRara";

    mapping(uint256 => bool) private _used; // Mapping token id to token state
    uint256 private randomSeed;

    constructor() ERC721("Ticket", "TKT") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, inicialImage);
    }

    function UseTicket(uint256 tokenId) public {
        _requireMinted(tokenId);
        require(!_used[tokenId], "Ticket: The ticket has already been used");
        require(ownerOf(tokenId) == msg.sender, "Ticket: Caller is not the owner of the token");
        _useTicket(tokenId);  
    }

    function _genRandomNumber() internal returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, randomSeed)));
        randomSeed = randomNumber;
        uint256 result = randomNumber % 11;
        if( result==0 || result==1 || result==2){ //normalImage1
            result = 0; 
        } else if(result==3 || result==4 || result==5){ //normalImage2
            result = 1; 
        } else if(result==6 || result==7){ //rareImage1
            result = 2;
        } else if(result==8 || result==9){ //rareImage2
            result = 3;
        } else if(result==10){ //SuperRareImage
            result = 4;
        }
        return result;
    }

    function _useTicket(uint256 tokenId) internal {
        uint256 option = _genRandomNumber();
        string memory usedImage;
        if (option == 0) {
            usedImage=normalImage1;
        } else if (option == 1) {
            usedImage=normalImage2;
        } else if (option == 2) {
            usedImage=rareImage1;
        } else if (option == 3) {
            usedImage=rareImage2;
        } else if (option == 4) { 
            usedImage=superRareImage;
        }
        _setTokenURI(tokenId, usedImage);
        _used[tokenId] = true;
    }

    function IsTicketUsed(uint256 ticketId) public view returns (bool) {
        return _used[ticketId];
    }

    function ResetTicket(uint256 tokenId) public onlyOwner{
        _requireMinted(tokenId);
        require(_used[tokenId], "Ticket: The ticket has already been reseted");
        _setTokenURI(tokenId, inicialImage);
        _used[tokenId] = false;
    }

// funções de verificação instantanea:
    function UseFirstTicket() public{
        uint256[] memory unusedTicks = _getNotUsedTicket(msg.sender);
        _useTicket(unusedTicks[0]);
    }

    function _getNotUsedTicket(address wallet) internal view returns (uint256[] memory) {
        uint256 totalTickets = balanceOf(wallet);
        require(totalTickets>0, "Ticket: Wallet has no tickets");

        uint256[] memory unusedTicks = new uint256[](totalTickets);
        uint256 count = 0;
        for (uint256 i = 0; i < totalTickets; i++) {
            uint256 ticketId = tokenOfOwnerByIndex(wallet, i);
            if (!_used[ticketId]) {
                unusedTicks[count] = ticketId;
                count++;
            }
        }
        require(count>0, "Ticket: Wallet has no unused tickets");
        return unusedTicks;
    }



    // The following functions are overrides required by Solidity
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
