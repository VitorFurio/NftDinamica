// SPDX-License-Identifier: MIT
const { expect } = require("chai");

describe("Ticket", function () {
  let Ticket;
  let ticketContract;
  let owner;
  let account1;
  let account2;
  let inicialImage = "ipfs://QmeCp6p5x5Td6VzS38BJvVyveDUEyEt2pXD7jjBduDTGiV";
  let normalImage1 = "ipfs://QmUabiSMedWzM7sQPaTtJAd8JetSP9QhT2qXbhN3ynGkUP";
  let normalImage2 = "ipfs://QmUuUqHVwsDpnY6ZvsXMAPsNptqMYCRB2Y6PiV1s1p2ttF";
  let rareImage1 = "ipfs://QmQk4huRhY2roxMU4ssAX6sbQwNhb2QoJn7D9mAZsbZZsj";
  let rareImage2 = "ipfs://QmTDAxAUeX6q4cn2Jfx8wqgJcPjC7Lz3TZ3mEN9cAhgddb";
  let superRareImage = "ipfs://QmQSQNsBbQj3c7zeipptxdeYTpYAyajJx3uxFYKfiBYAWh";

  beforeEach(async function () {
    Ticket = await ethers.getContractFactory("Ticket");
    [owner, account1, account2] = await ethers.getSigners();
    ticketContract = await Ticket.deploy();
    await ticketContract.deployed();
  });

  describe("Deployment", function () {
    it("deve ter o nome e símbolo corretos", async function () {
      expect(await ticketContract.name()).to.equal("Infinity Ticket");
      expect(await ticketContract.symbol()).to.equal("IFTY");
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

  describe("Funções de leitura do contrato", function () {
    it("deve retornar o estado correto do ticket ", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      const token0state = await ticketContract.IsTicketUsed(0);
      const token1state = await ticketContract.IsTicketUsed(1);
      expect(token0state).to.equal(true);
      expect(token1state).to.equal(false);
    });

    it("deve retornar erro ao tentar acessar informações de tokens que não existem", async function () {
      await expect(ticketContract.connect(owner).IsTicketUsed(1)).to.be.revertedWith(
        "ERC721: invalid token ID"
      );
    });

    it("Deve retornar erro ao ser chamado por uma carteira que não tem tickets", async function () {
      await expect(ticketContract.GetNotUsedTicket(account1.address)).to.be.revertedWith(
        "Ticket: Wallet has no tickets"
      );
    });

    it("Deve retornar erro ao ser chamado por uma carteira que já usou todos os tickets", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      await expect(ticketContract.GetNotUsedTicket(account1.address)).to.be.revertedWith(
        "Ticket: Wallet has no unused tickets"
      );
    });

    it("Deve retornar os tickets não utilizados da carteira", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      let ticketsBigNumber = await ticketContract.GetNotUsedTicket(account1.address);
      await ticketContract.connect(account1).UseTicket(ticketsBigNumber[0]);
      await ticketContract.connect(account1).UseTicket(ticketsBigNumber[1]);
      ticketsBigNumber = await ticketContract.GetNotUsedTicket(account1.address);
      let tickets=[];
      for(let i=0;i<ticketsBigNumber.length;i++){
          tickets[i]=ticketsBigNumber[i].toNumber();
      }
      expect(tickets).to.deep.equal([2]);
    });

    it("Se retorna Big Number", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      let tickets = await ticketContract.tokenOfOwnerByIndex(account1.address,1);
      expect(tickets.toNumber()).to.equal(1);
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
    it("teste da função", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).UseFirstTicket(account1.address);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.not.equal(inicialImage)
    });

    it("deve falhar se a carteira do usuário não tiver tickets", async function () {
      await expect(ticketContract.connect(owner).UseFirstTicket(account1.address)).to.be.revertedWith(
        "Ticket: Wallet has no tickets"
      );
    });

    it("deve falhar se a carteria do usuário só tiver tickets usados", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(owner).UseFirstTicket(account1.address);
      await ticketContract.connect(owner).UseFirstTicket(account1.address);
      await expect(ticketContract.connect(owner).UseFirstTicket(account1.address)).to.be.revertedWith(
        "Ticket: Wallet has no unused tickets"
      );
    });

    it("teste de falha na função UseFirstTicket: Não pode validar o ticket de ID=0", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await expect(ticketContract.connect(owner).UseFirstTicket(account2.address)).to.be.revertedWith(
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
      await ticketContract.connect(owner).UseFirstTicket(account1.address);
      await ticketContract.connect(owner).UseFirstTicket(account1.address);
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
      await ticketContract.connect(account1)['safeTransferFrom(address,address,uint256)'](account1.address,account2.address,0);
      await ticketContract.connect(account2).UseTicket(0);
      const tokenURI = await ticketContract.tokenURI(0);
      expect(tokenURI).to.not.equal(inicialImage)
    });

    it("Tranferência de ticket usado", async function () {
      await ticketContract.connect(owner).safeMint(account1.address);
      await ticketContract.connect(account1).UseTicket(0);
      await ticketContract.connect(account1)['safeTransferFrom(address,address,uint256)'](account1.address,account2.address,0);
      await expect(ticketContract.connect(account2).UseTicket(0)).to.be.revertedWith(
        "Ticket: The ticket has already been used"
      );
      await expect(ticketContract.connect(owner).UseFirstTicket(account2.address)).to.be.revertedWith(
        "Ticket: Wallet has no unused tickets"
      );
    });
  });

});
