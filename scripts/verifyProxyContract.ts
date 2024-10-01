import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Function to make the API request
async function verifyProxyContract(proxyAddress: string, expectedImplementation: string) {
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (!apiKey) {
    throw new Error('Etherscan API key is not defined in .env');
  }

  const url = `https://api.etherscan.io/api?module=contract&action=verifyproxycontract&apikey=${apiKey}`;
  
  const data = {
    address: proxyAddress,
    expectedimplementation: expectedImplementation
  };

  try {
    const response = await axios.post(url, new URLSearchParams(data).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log('Etherscan API response:', response.data);
  } catch (error) {
    console.error('Error verifying proxy contract:', error);
  }
}

async function main() {
  // Dynamically retrieve the proxy and implementation addresses from the deployment
  const proxyAddress = process.env.PROXY_ADDRESS || '0x5d1Bb66aAc5010E693c9421c7AbcF971243443F4';  // Replace or fetch from env if needed

  // Get the implementation address using the proxy admin
  const expectedImplementation = '0xab7B5C1C4292C712be9000234E4B72130c507429';

  // Call the verification function
  await verifyProxyContract(proxyAddress, expectedImplementation);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
