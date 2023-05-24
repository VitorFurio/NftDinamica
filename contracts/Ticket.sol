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
    string option1 = "ipfs://Imagem1";
    string option2 = "ipfs://Imagem2";
    string option3 = "ipfs://Imagem3";

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
        require(!_used[tokenId], "Ticket:The ticket has already been used");
        require(ownerOf(tokenId) == msg.sender, "Ticket: Caller is not the owner of the token");
        _usedTicket(tokenId);  
    }

    function _genRandomNumber() internal returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, randomSeed)));
        randomSeed = randomNumber;
        return randomNumber;
    }

    function _usedTicket(uint256 tokenId) internal {
        uint256 randomNumber = _genRandomNumber();
        uint256 option = randomNumber % 3;
        string memory usedImage;
        if (option == 0) {
            usedImage=option1;
        } else if (option == 1) {
            usedImage=option2;
        } else {
            usedImage=option3;
        }
        _setTokenURI(tokenId, usedImage);
        _used[tokenId] = true;
    }

    function IsTicketUsed(uint256 ticketId) public view returns (bool) {
        return _used[ticketId];
    }

    function ResetTicket(uint256 tokenId) public onlyOwner{
        _requireMinted(tokenId);
        require(_used[tokenId], "Ticket:The ticket has already been reseted");
        _setTokenURI(tokenId, inicialImage);
        _used[tokenId] = false;
    }

// funções de verificação instantanea:
    function UseFirstTicket() public{
        uint256[] memory ticketsNaoUtilizados = _getNotUsedTicket(msg.sender);
        _usedTicket(ticketsNaoUtilizados[0]);
    }

    function _getNotUsedTicket(address wallet) internal view returns (uint256[] memory) {
        uint256[] memory ticketsNaoUtilizados;
        uint256 totalTickets = balanceOf(wallet);
        uint256 contador = 0;
        for (uint256 i = 0; i < totalTickets; i++) {
            uint256 ticketId = tokenOfOwnerByIndex(wallet, i);

            if (!_used[ticketId]) {
                ticketsNaoUtilizados[contador] = ticketId;
                contador++;
            }
        }
        return ticketsNaoUtilizados;
    }



    // The following functions are overrides required by Solidity.

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
