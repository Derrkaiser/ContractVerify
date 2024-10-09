import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

// Sleep function to pause execution
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get the implementation address from the proxy
async function getAddressInSlot(address: string, slot: string): Promise<string> {
  const slotValue = await ethers.provider.getStorageAt(address, slot);
  return ethers.utils.getAddress(`0x${slotValue.slice(-40)}`);
}

// Implementation slot constant for the proxy
const ImplementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";

async function main() {
  // Step 1: Deploy the BasicToken implementation
  const BasicToken: ContractFactory = await ethers.getContractFactory("BasicToken");
  console.log("Deploying BasicToken implementation...");
  const basicTokenImplementation = await BasicToken.deploy();
  await basicTokenImplementation.deployed();
  console.log(basicTokenImplementation.address, "BasicToken implementation address");

  // Step 2: Deploy the ProxyAdmin contract
  const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
  console.log("Deploying ProxyAdmin...");
  const proxyAdmin = await ProxyAdmin.deploy();
  await proxyAdmin.deployed();
  console.log(proxyAdmin.address, "ProxyAdmin address");

  // Step 3: Deploy the Proxy contract with initialization data
  const initialSupply = ethers.utils.parseUnits("1000000", 18); // 1 million tokens with 18 decimals
  const proxyData = BasicToken.interface.encodeFunctionData("initialize", [
    "Etherscan Verification Test", // Token name
    "EVT",                         // Token symbol
    initialSupply                  // Initial supply
  ]);

  console.log("ProxyData: ",proxyData);
  const Proxy = await ethers.getContractFactory("CustomProxy");
  console.log("Deploying Proxy...");

  // Define constructor arguments: [implementation, proxyAdmin, initialization data]
  const proxy = await Proxy.deploy(basicTokenImplementation.address, proxyAdmin.address, proxyData);
  await proxy.deployed();
  console.log(proxy.address, "Proxy address");

  // Step 4: Verify the proxy setup
  console.log("Getting Proxy implementation address using the storage slot...");
  const implementationAddress = await getAddressInSlot(proxy.address, ImplementationSlot);
  console.log(implementationAddress, "Implementation address from proxy");

  // Step 5: Optional - Interact with the BasicToken contract through the proxy
  const basicTokenProxy = BasicToken.attach(proxy.address); // Attach BasicToken contract to the proxy
  const name = await basicTokenProxy.name();
  const symbol = await basicTokenProxy.symbol();
  const totalSupply = await basicTokenProxy.totalSupply();

  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.utils.formatUnits(totalSupply, 18)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
