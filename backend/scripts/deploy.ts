import { network } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
    const connection = await network.connect();
    const { ethers } = connection;
    const [deployer] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("InsuranceFraudRegistry");
    const registry = await factory.deploy();
    await registry.waitForDeployment();
    const address = await registry.getAddress();
    const chainId = (await ethers.provider.getNetwork()).chainId.toString();
    const deployment = { contractName: "InsuranceFraudRegistry", address, network: connection.networkName, chainId, deployer: deployer.address };
    const outputDirectory = path.resolve(process.cwd(), "deployments");
    fs.mkdirSync(outputDirectory, { recursive: true });
    fs.writeFileSync(path.join(outputDirectory, "InsuranceFraudRegistry.json"), `${JSON.stringify(deployment, null, 2)}\n`);
    const envPath = path.resolve(process.cwd(), ".env");
    const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    const addressLine = `BLOCKCHAIN_CONTRACT_ADDRESS=${address}`;
    fs.writeFileSync(
        envPath,
        envContent.match(/^BLOCKCHAIN_CONTRACT_ADDRESS=/m)
            ? envContent.replace(/^BLOCKCHAIN_CONTRACT_ADDRESS=.*$/m, addressLine)
            : `${envContent.trimEnd()}\n${addressLine}\n`
    );
    console.log(JSON.stringify(deployment, null, 2));
    console.log("Deployment saved to deployments/InsuranceFraudRegistry.json");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
