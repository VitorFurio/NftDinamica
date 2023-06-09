// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Author: @vitor.furio
contract Ticket is ERC721, ERC721Enumerable, ERC721Burnable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string inicialImage = "ipfs://QmeCp6p5x5Td6VzS38BJvVyveDUEyEt2pXD7jjBduDTGiV";
    string normalImage1 = "ipfs://QmUabiSMedWzM7sQPaTtJAd8JetSP9QhT2qXbhN3ynGkUP";
    string normalImage2 = "ipfs://QmUuUqHVwsDpnY6ZvsXMAPsNptqMYCRB2Y6PiV1s1p2ttF";
    string rareImage1 = "ipfs://QmQk4huRhY2roxMU4ssAX6sbQwNhb2QoJn7D9mAZsbZZsj";
    string rareImage2 = "ipfs://QmTDAxAUeX6q4cn2Jfx8wqgJcPjC7Lz3TZ3mEN9cAhgddb";
    string superRareImage = "ipfs://QmQSQNsBbQj3c7zeipptxdeYTpYAyajJx3uxFYKfiBYAWh";

    mapping(uint256 => bool) private _used; // Mapping token id to token state
    
    uint256 private randomSeed;

    constructor() ERC721("Infinity Ticket", "IFTY") {}

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
        _requireMinted(ticketId);
        return _used[ticketId];
    }

    function ResetTicket(uint256 tokenId) public onlyOwner{
        _requireMinted(tokenId);
        require(_used[tokenId], "Ticket: The ticket has already been reseted");
        _setTokenURI(tokenId, inicialImage);
        _used[tokenId] = false;
    }

// funções de verificação instantânea:
    function UseFirstTicket(address user) public onlyOwner{
        uint256[] memory unusedTicks = GetNotUsedTicket(user);
        _useTicket(unusedTicks[0]);
    }

    function GetNotUsedTicket(address wallet) public view returns (uint256[] memory) {
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

        // Criar um novo vetor com o tamanho exato dos tickets não utilizados
        uint256[] memory finalUnusedTicks = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            finalUnusedTicks[i] = unusedTicks[i];
        }
        return finalUnusedTicks;
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
