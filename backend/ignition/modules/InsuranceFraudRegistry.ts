import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Hardhat Ignition deployment module for InsuranceFraudRegistry
 * 
 * Deploy with:
 *   npx hardhat ignition deploy ignition/modules/InsuranceFraudRegistry.ts --network hardhatMainnet
 * 
 * Or with the npm script:
 *   npm run deploy:local
 */
export default buildModule("InsuranceFraudRegistryModule", (m) => {
  const registry = m.contract("InsuranceFraudRegistry");
  return { registry };
});
