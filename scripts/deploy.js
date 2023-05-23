// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
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
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
