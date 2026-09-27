const path = require("path");
const fs = require("fs");
require("dotenv").config();

const DEPLOYMENT_FILE = path.resolve(
    __dirname,
    "../deployments/InsuranceFraudRegistry.json"
);
const ARTIFACT_FILE = path.resolve(
    __dirname,
    "../artifacts/contracts/InsuranceFraudRegistry.sol/InsuranceFraudRegistry.json"
);

function loadDeploymentAddress() {
    if (process.env.BLOCKCHAIN_CONTRACT_ADDRESS) {
        return process.env.BLOCKCHAIN_CONTRACT_ADDRESS;
    }

    if (process.env.CONTRACT_ADDRESS) {
        return process.env.CONTRACT_ADDRESS;
    }

    if (fs.existsSync(DEPLOYMENT_FILE)) {
        const data = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
        if (data.address) {
            return data.address;
        }
    }

    return null;
}

module.exports = {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
    network: process.env.BLOCKCHAIN_NETWORK || "localhost",
    contractAddress: loadDeploymentAddress() || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    privateKey:
        process.env.BLOCKCHAIN_PRIVATE_KEY ||
        process.env.DEPLOYER_PRIVATE_KEY ||
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    artifactPath: ARTIFACT_FILE,
    deploymentFile: DEPLOYMENT_FILE,
    loadDeploymentAddress,
};
