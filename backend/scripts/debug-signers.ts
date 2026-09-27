import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const { ethers } = connection;
  const signers = await ethers.getSigners();
  console.log("signers length:", signers.length);
  console.log("network:", connection.networkName);
  if (signers[0]) {
    console.log("deployer:", signers[0].address);
  }
}

main().catch(console.error);
