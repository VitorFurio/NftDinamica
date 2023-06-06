// SPDX-License-Identifier: MIT
const { expect } = require("chai");

describe("Ticket", function () {
  let Ticket;
  let ticketContract;
  let owner;
  let account1;
  let account2;
  let inicialImage = "ipfs://ImagemInicial";
  let normalImage1 = "ipfs://ImagemNormal1";
  let normalImage2 = "ipfs://ImagemNormal2";
  let rareImage1 = "ipfs://ImagemRara1";
  let rareImage2 = "ipfs://ImagemRara2";
  let superRareImage = "ipfs://ImagemSuperRara";

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
      const uri = inicialImage
      await ticketContract.connect(owner).safeMint(account1.address);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.equal(uri);
    });
    it("deve retornar os indices das NFTs que pertencem a uma conta", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(owner.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      const tokenId = await ticketContract.tokenOfOwnerByIndex(account1.address, 2);
      expect(tokenId).to.equal(3);
    });
  });



  describe("Função UseTicket", function () {

    it("deve permitir que apenas quem possui um ticket possa utiliza-lo", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await expect(ticketContract.connect(owner).UseTicket(0)).to.be.revertedWith(
        "Ticket: Caller is not the owner of the token"
      );
    });

    it("deve impedir que um ticket seja utilizado duas vezes", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      await expect(ticketContract.connect(account1).UseTicket(0)).to.be.revertedWith(
        "Ticket: The ticket has already been used"
      );
    });

    it("deve modificar a URI quando o token for utilizado", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.not.equal(inicialImage)
    });

    it("deve permitir que o dono do contrato reset um ticket", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      await ticketContract.connect(owner).ResetTicket(0);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.equal(inicialImage)
    });

  });



  describe("Função UseFirstTicket", function () {
    it("deve permitir que quem possui no minimo um ticket possa utiliza-lo sem imformar parâmetros", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseFirstTicket();
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.not.equal(inicialImage)
    });

    it("deve falhar se o usuário não tiver tickets", async function () {
      await expect(ticketContract.connect(account1).UseFirstTicket()).to.be.revertedWith(
        "Ticket: Wallet has no tickets"
      );
    });

    it("deve falhar se o usuário só tiver tickets usados", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseFirstTicket();
      await ticketContract.connect(account1).UseFirstTicket();
      await expect(ticketContract.connect(account1).UseFirstTicket()).to.be.revertedWith(
        "Ticket: Wallet has no unused tickets"
      );
    });

    it("teste de falha na função UseFirstTicket: Não pode validar o ticket de ID=0", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await expect(ticketContract.connect(account2).UseFirstTicket()).to.be.revertedWith(
        "Ticket: Wallet has no tickets"
      );
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.equal(inicialImage)
      const isTicketUsed = await ticketContract.IsTicketUsed(0);
      expect(isTicketUsed).to.equal(false);
    });

    it("teste de uso simultâneo de UseTicekt e UseFirstTicket", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(1);
      await ticketContract.connect(account1).UseFirstTicket();
      await ticketContract.connect(account1).UseFirstTicket();
      const tokenURI = await ticketContract.tokenURI(2);
      expect(tokenURI).to.not.equal(inicialImage)
    });

  });



  describe("Transferência de tickets", function () {

    it("permite a transferência de tickets", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1)
      ['safeTransferFrom(address,address,uint256)']
      (account1.address,account2.address,0);
      const balanceOf = await ticketContract.balanceOf(account2.address);
      expect(balanceOf).to.equal(1);
    });

    it("Tranferência de ticket não usado", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1)
      ['safeTransferFrom(address,address,uint256)']
      (account1.address,account2.address,0);
      await ticketContract.connect(account2).UseFirstTicket();
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.not.equal(inicialImage)
    });

    it("Tranferência de ticket usado", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseFirstTicket();
      await ticketContract.connect(account1)
      ['safeTransferFrom(address,address,uint256)']
      (account1.address,account2.address,0);
      await expect(ticketContract.connect(account2).UseFirstTicket()).to.be.revertedWith(
        "Ticket: Wallet has no unused tickets"
      );
    });
  });

});
