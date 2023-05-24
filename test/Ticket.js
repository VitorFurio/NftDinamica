// SPDX-License-Identifier: MIT
const { expect } = require("chai");

describe("Ticket", function () {
  let Ticket;
  let ticketContract;
  let owner;
  let account1;
  let account2;
  let whiteImage = "ipfs://QmRDYcjmr2rXNsdrCcggKTihxZjSZxvuRxN3WDLBubGoq7";
  let BlackImage = "ipfs://QmfUFoUa8GPkCiW7JgSZP7ZxSFSYU8zZgerDULezfoFoqC";

  beforeEach(async function () {
    Ticket = await ethers.getContractFactory("Ticket");
    [owner, account1, account2] = await ethers.getSigners();
    ticketContract = await Ticket.deploy();
    await ticketContract.deployed();
  });

  describe("Deployment", function () {
    it("deve ter o nome e símbolo corretos", async function () {
      expect(await ticketContract.name()).to.equal("Ticket");
      expect(await ticketContract.symbol()).to.equal("TKT");
    });
  });

  describe("Mintagem", function () {
    it("deve permitir a mintagem segura pelo owner", async function () {
      const uri = "ipfs://example/NaoUsado";
      await ticketContract.connect(owner).safeMint(owner.address);
  
      const transferEvent = (await ticketContract.queryFilter("Transfer"))[0];
      expect(transferEvent.args.from).to.equal(ethers.constants.AddressZero);
      expect(transferEvent.args.to).to.equal(owner.address);
      expect(transferEvent.args.tokenId).to.equal(0);
      expect(await ticketContract.totalSupply()).to.equal(1);
    });
  
    it("deve impedir a mintagem por uma conta que não seja o owner", async function () {
      await expect(ticketContract.connect(account1).safeMint(owner.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("A URI da mintagem da NFT deve ser a URI padrão definida no contrato", async function () {
      const uri = whiteImage
      await ticketContract.connect(owner).safeMint(account1.address);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.equal(uri);
    });
  });

  describe("Muda a Imagem", function () {
    it("deve retornar os indices das NFTs que pertencem a uma conta", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(owner.address);
  
      const tokenId = await ticketContract.tokenOfOwnerByIndex(account1.address, 0);
      expect(tokenId).to.equal(0);
    });
  
    it("deve impedir que uma carteira que não é dona da NFT posssa Muda-lo", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await expect(ticketContract.connect(owner).ChangeImage(0)).to.be.revertedWith(
        "Ticket: Caller is not the owner of the token"
      );
    });
  
    it("deve utilizar apenas tokens qua já foram criados", async function () {
      await expect(ticketContract.connect(owner).ChangeImage(0)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("deve modificar a URI quando o token for utilizado", async function () {
      const uri = BlackImage;
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).ChangeImage(0);
  
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.equal(uri);
    });
  });

});
