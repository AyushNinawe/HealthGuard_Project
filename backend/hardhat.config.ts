import "dotenv/config";
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

const localhostAccounts = process.env.BLOCKCHAIN_PRIVATE_KEY
    ? [process.env.BLOCKCHAIN_PRIVATE_KEY]
    : process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [];

export default defineConfig({
    plugins: [
        hardhatToolboxMochaEthersPlugin
    ],

    solidity: {
        profiles: {
            default: {
                version: "0.8.28"
            },

            production: {
                version: "0.8.28",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200
                    }
                }
            }
        }
    },

    networks: {
        // Local Hardhat blockchain
        localhost: {
            type: "http",
            chainType: "l1",
            url: "http://127.0.0.1:8545",
            accounts: localhostAccounts
        },

        // Built-in Hardhat network
        hardhatMainnet: {
            type: "edr-simulated",
            chainType: "l1"
        },

        hardhatOp: {
            type: "edr-simulated",
            chainType: "op"
        },

        // Sepolia - later
        sepolia: {
            type: "http",
            chainType: "l1",
            url: configVariable("SEPOLIA_RPC_URL"),
            accounts: [
                configVariable("SEPOLIA_PRIVATE_KEY")
            ]
        }
    }
});