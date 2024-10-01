import { ethers } from "hardhat";
import { ContractFactory } from "ethers";

// Sleep function to pause the execution
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to get the implementation address from the proxy
async function getAddressInSlot(address: string, slot: string): Promise<string> {
  const slotValue = await ethers.provider.getStorageAt(address, slot);
  return ethers.utils.getAddress(`0x${slotValue.slice(-40)}`);
}

// Implementation slot constant for the proxy
const ImplementationSlot = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"; // bytes32 representation of the implementation slot

async function main() {
  // Step 1: Deploy the Box contract implementation
  const Box: ContractFactory = await ethers.getContractFactory("Box");
  console.log("Deploying Box implementation...");
  const boxImplementation = await Box.deploy();
  await boxImplementation.deployed();
  console.log(boxImplementation.address, "Box implementation address");

  // Step 2: Deploy the custom ProxyAdmin contract
  const ProxyAdmin = await ethers.getContractFactory("CustomProxyAdmin");
  console.log("Deploying ProxyAdmin...");
  const proxyAdmin = await ProxyAdmin.deploy();
  await proxyAdmin.deployed();
  console.log(proxyAdmin.address, "ProxyAdmin address");

  // Step 3: Deploy the custom Proxy contract
  const proxyData = Box.interface.encodeFunctionData("store", [42]); // Assuming Box has an initializer "store(uint256)"
  console.log(proxyData)
  const Proxy = await ethers.getContractFactory("CustomProxy");
  console.log("Deploying Proxy...");

  // Define the types of arguments in the order they appear in the constructor
const types = ["address", "address", "bytes"];
const constructorArguments = [boxImplementation.address, proxyAdmin.address, proxyData];

// ABI encode the constructor arguments
const encodedConstructorArgs = ethers.utils.defaultAbiCoder.encode(types, constructorArguments);

console.log(encodedConstructorArgs);


  const proxy = await Proxy.deploy(boxImplementation.address, proxyAdmin.address, proxyData); // Use proxyAdmin address
  await proxy.deployed();
  console.log(proxy.address, "Proxy address");

  // // Wait for 30 seconds before interacting with the contract
  // console.log("Waiting for 30 seconds to allow the contract to confirm on the chain...");
  // await sleep(30000);

  // Step 4: Verify the proxy setup
  console.log("Getting Proxy implementation address using the storage slot...");
  const implementationAddress = await getAddressInSlot(proxy.address, ImplementationSlot);
  console.log(implementationAddress, "Implementation address from proxy");

  // Step 5: Optional - Interact with the Box contract through the proxy
  const boxProxy = Box.attach(proxy.address); // Attach the Box contract to the proxy address
  const value = await boxProxy.retrieve(); // Assuming Box has a `retrieve()` function to get stored value
  console.log(value.toString(), "Stored value in Box through proxy");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
