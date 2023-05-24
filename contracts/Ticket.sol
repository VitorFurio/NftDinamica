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

    string whiteImage = "ipfs://QmRDYcjmr2rXNsdrCcggKTihxZjSZxvuRxN3WDLBubGoq7";
    string blackImage = "ipfs://QmfUFoUa8GPkCiW7JgSZP7ZxSFSYU8zZgerDULezfoFoqC";

    constructor() ERC721("Ticket", "TKT") {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, whiteImage);
    }

    function ChangeImage(uint256 tokenId) public {
    require(ownerOf(tokenId) == msg.sender, "Ticket: Caller is not the owner of the token");
    if (keccak256(bytes(tokenURI(tokenId))) == keccak256(bytes(whiteImage))) {
        _setTokenURI(tokenId, blackImage);
    } else {
        _setTokenURI(tokenId, whiteImage);
    }
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
