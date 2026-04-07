import { ethers } from 'ethers';
import MediChainArtifact from '../artifacts/contracts/MediChainRecords.sol/MediChainRecords.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

/**
 * Conceptual function for uploading to IPFS via Pinata
 * @param file The file to upload
 * @returns The IPFS CID (Hash)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  console.log("Uploading file to IPFS:", file.name);
  
  // In a real production app, you would use the Pinata SDK or API
  // Example using Pinata API:
  /*
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT}`
    },
    body: formData
  });
  const data = await res.json();
  return data.IpfsHash;
  */

  // Mocking the IPFS hash for demonstration
  return "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";
}

/**
 * Adds a medical record reference to the blockchain
 */
export async function addRecordOnChain(
  patientAddress: string,
  ipfsHash: string,
  recordType: string
) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MediChainArtifact.abi,
    signer
  );

  console.log(`Recording ${recordType} on-chain for patient ${patientAddress}...`);
  
  const tx = await contract.addMedicalRecord(patientAddress, ipfsHash, recordType);
  const receipt = await tx.wait();
  
  console.log("Transaction confirmed:", receipt.hash);
  return receipt;
}

/**
 * Fetches the audit log by querying MedicalRecordAdded events
 */
export async function fetchAuditLog(patientAddress?: string) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MediChainArtifact.abi,
    provider
  );

  // Create filter for the MedicalRecordAdded event
  // If patientAddress is provided, filter by it (it's indexed in the contract)
  const filter = contract.filters.MedicalRecordAdded(patientAddress);
  
  // Query events from the last 10,000 blocks (or from deployment)
  const events = await contract.queryFilter(filter, -10000);

  return events.map(event => {
    // Ethers v6 event parsing
    const { patientAddress, ipfsHash, recordType, timestamp, uploader } = (event as any).args;
    
    return {
      patientAddress,
      ipfsHash,
      recordType,
      timestamp: Number(timestamp),
      uploader,
      transactionHash: event.transactionHash,
      formattedDate: new Date(Number(timestamp) * 1000).toLocaleString()
    };
  }).reverse(); // Newest first
}
