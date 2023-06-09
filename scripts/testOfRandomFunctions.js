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

  let notUsedTicket = await ticketContract.connect(deployer).GetNotUsedTicket(deployer.address);
  console.log(notUsedTicket)

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
  let inicialImage = "ipfs://QmeCp6p5x5Td6VzS38BJvVyveDUEyEt2pXD7jjBduDTGiV";
  let normalImage1 = "ipfs://QmUabiSMedWzM7sQPaTtJAd8JetSP9QhT2qXbhN3ynGkUP";
  let normalImage2 = "ipfs://QmUuUqHVwsDpnY6ZvsXMAPsNptqMYCRB2Y6PiV1s1p2ttF";
  let rareImage1 = "ipfs://QmQk4huRhY2roxMU4ssAX6sbQwNhb2QoJn7D9mAZsbZZsj";
  let rareImage2 = "ipfs://QmTDAxAUeX6q4cn2Jfx8wqgJcPjC7Lz3TZ3mEN9cAhgddb";
  let superRareImage = "ipfs://QmQSQNsBbQj3c7zeipptxdeYTpYAyajJx3uxFYKfiBYAWh";

  for (let i = 0; i < tokenURIs.length; i++) {
    if(tokenURIs[i]==normalImage1 || tokenURIs[i]==normalImage2){
      normal++;
    }
    if(tokenURIs[i]==rareImage1 || tokenURIs[i]==rareImage2){
      rara++;
    }
    if(tokenURIs[i]==superRareImage){
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
