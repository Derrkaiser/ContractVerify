import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as qs from 'qs';

// Load environment variables from .env file
dotenv.config();

// Function to load the build-info JSON from Hardhat compile output
function getBuildInfoJson(): any {
  const filePath = path.join(__dirname, '../artifacts', 'build-info'); // Path to the build-info directory
  const files = fs.readdirSync(filePath); // Read all files in the directory

  if (files.length === 0) {
    throw new Error('No compiled output found in artifacts/build-info');
  }

  // Pick the first JSON file (Hardhat generates unique filenames)
  const jsonFile = files.find(file => file.endsWith('.json'));

  if (!jsonFile) {
    throw new Error('No .json file found in artifacts/build-info');
  }

  // Read the file content
  const jsonData = fs.readFileSync(path.join(filePath, jsonFile), 'utf-8');
  return JSON.parse(jsonData);
}

// Define the function to extract relevant source code
function getSourceCodeForContract(contractName: string): string {
  const buildInfo = getBuildInfoJson();


  // Extract the sources and include only the relevant contract
  const sources = buildInfo.input.sources;
  const contractFilePath = `contracts/${contractName}.sol`;

  if (!sources[contractFilePath]) {
    throw new Error(`Source file for ${contractName} not found in build info.`);
  }

  // Create the input object to return
  const input = {
    language: buildInfo.input.language,
    sources: {
      [contractFilePath]: {
        content: sources[contractFilePath].content // Extract the content
      }
    },
    settings: buildInfo.input.settings // Include the settings
  };

  return JSON.stringify(input); // Convert the input to string for the request
}

// Define the function to verify the source code
async function verifySourceCode(contractName: string, contractAddress: string) {
  const apiKey = process.env.ETHERSCAN_API_KEY; // Retrieve API key from .env
  const url = 'https://api.etherscan.io/api';

  if (!apiKey) {
    throw new Error('API key is not defined in .env');
  }

  // Get the Solidity standard JSON input from Hardhat's output
  const solidityStandardJsonInput = getSourceCodeForContract(contractName);

  // console.log(solidityStandardJsonInput)


  // Define the request parameters
  const data = {
    module: 'contract',
    action: 'verifysourcecode',
    chainId: '11155111', // Change this to the correct chain ID if needed
    codeformat: 'solidity-standard-json-input', // Set code format to JSON input
    sourceCode: solidityStandardJsonInput, // Converted source code
    constructorArguements: '', // Constructor arguments in hexadecimal, optional
    contractaddress: contractAddress, // Contract address to verify
    contractname: `contracts/${contractName}.sol:${contractName}`, // Correct path and name for the contract
    compilerversion: 'v0.8.20+commit.a1b79de6', // Replace with the compiler version used
    apikey: apiKey
  };

  // Send the POST request
  try {
    const response = await axios.post(url, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    console.log(response.data); // Handle the response from the API
  } catch (error) {
    console.error('Error verifying contract:', error);
  }
}

// Example call: Replace 'Box' and '0xYourContractAddress' with your contract name and address
// verifySourceCode('Box', '0xD3802C1202080a3dbd953A2Bd00a15b35E029Dbe');
// verifySourceCode('CustomProxy', '0x2b602663Cbcd80EBbCEE6680ff9b939dA750296a');
verifySourceCode('CustomProxyAdmin', '0x6ba6b22c3BbF8f147AcB9637D911033C4D73581D');


