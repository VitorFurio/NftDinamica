const hre = require("hardhat");

async function main() {
  // Obter o endereço da conta que realizará o deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Ticket contract with the account:", deployer.address);

 // Compilar o contrato Ticket
 const Ticket = await ethers.getContractFactory("Ticket");

 // Deploy do contrato
 const ticketContract = await Ticket.deploy();
 await ticketContract.deployed();
 console.log("Ticket contract deployed to:", ticketContract.address);


 let qntd = 110;
 // Mintagem do itens
  for (let i = 0; i < qntd; i++) {
    await ticketContract.connect(deployer).safeMint(deployer.address);
  }

// Utilização dos itens
  for (let i = 0; i < qntd; i++) {
    await ticketContract.connect(deployer).UseFirstTicket();
  }

// Printa todos os itens da carteira deployer
  totalTickets = await ticketContract.balanceOf(deployer.address);
  let tokenURIs = [];
  console.log(deployer.address + "tem um total de "+ totalTickets + " tickets.");
  for (let i = 0; i < totalTickets; i++) {
      let ticketId = await ticketContract.tokenOfOwnerByIndex(deployer.address, i);
      let tokenURI = await ticketContract.tokenURI(ticketId);
      tokenURIs.push(tokenURI);
  }

  let normal=0;
  let rara = 0;
  let superRara=0;
  for (let i = 0; i < tokenURIs.length; i++) {
    if(tokenURIs[i]=="ipfs://ImagemNormal1" || tokenURIs[i]=="ipfs://ImagemNormal2"){
      normal++;
    }
    if(tokenURIs[i]=="ipfs://ImagemRara1" || tokenURIs[i]=="ipfs://ImagemRara2"){
      rara++;
    }
    if(tokenURIs[i]=="ipfs://ImagemSuperRara"){
      superRara++;
    }
    console.log(tokenURIs[i]);
  }

  console.log("Imagens normais: "+ normal)
  console.log("Imagens rara: "+ rara)
  console.log("Imagens superRara: "+ superRara)
 
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
