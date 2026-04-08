import { ethers } from 'ethers';
import MediChainArtifact from '../artifacts/contracts/MediChainRecords.sol/MediChainRecords.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"; 

const SEPOLIA_CHAIN_ID = "0xaa36a7"; // 11155111

/**
 * Ensures the user is connected to the Sepolia network
 */
export async function ensureSepoliaNetwork() {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  
  if (chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'Sepolia ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }
}

// In-memory storage for simulated logs (persists during session)
const simulatedLogs: any[] = [];

/**
 * Simulates a blockchain transaction for demo purposes
 */
export async function simulateRecordOnChain(
  patientAddress: string,
  ipfsHash: string,
  recordType: string
) {
  // Artificial delay to mimic blockchain processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const txHash = "0x" + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const timestamp = Math.floor(Date.now() / 1000);
  
  const newLog = {
    patientAddress,
    ipfsHash,
    recordType,
    timestamp,
    uploader: "0xDemoUserAddress",
    transactionHash: txHash,
    formattedDate: new Date(timestamp * 1000).toLocaleString(),
    isSimulated: true
  };
  
  simulatedLogs.unshift(newLog);
  
  // Also save to localStorage for persistence across reloads in demo
  const saved = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  saved.unshift(newLog);
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(saved.slice(0, 50)));

  return { hash: txHash, ipfsHash };
}

/**
 * Conceptual function for uploading to IPFS via Pinata
 * @param file The file to upload
 * @returns The IPFS CID (Hash)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  console.log("Uploading file to IPFS via Pinata:", file.name);
  
  const jwt = import.meta.env.VITE_PINATA_JWT;
  
  if (!jwt) {
    console.warn("Pinata JWT not found in environment. Falling back to simulation CID.");
    // Fallback to a real sample CID if no API key is provided yet
    return "QmPZ9gcCEpqKTo6aq61g2nd7KxcyvecyvMT99cOc7yEn1K";
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        app: 'MediChain',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', options);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`
      },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`Pinata upload failed: ${errorData.error?.details || res.statusText}`);
    }

    const data = await res.json();
    console.log("File pinned successfully:", data.IpfsHash);
    return data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
}

/**
 * Returns a gateway link for an IPFS CID
 */
export function getIPFSLink(cid: string) {
  // If CID is missing or invalid, use a sample CID for the demo to prevent broken redirects
  const effectiveCid = (!cid || cid.startsWith('0x')) 
    ? "QmPZ9gcCEpqKTo6aq61g2nd7KxcyvecyvMT99cOc7yEn1K" 
    : cid;
  
  // Use dedicated gateway if provided, otherwise fallback to ipfs.io
  // ipfs.io is the most permissive public gateway for viewing various content types
  const gateway = import.meta.env.VITE_PINATA_GATEWAY_URL || 'https://ipfs.io';
  
  // Ensure no trailing slash in gateway URL
  const base = gateway.endsWith('/') ? gateway.slice(0, -1) : gateway;
  return `${base}/ipfs/${effectiveCid}`;
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
  
  const hash = receipt.hash || receipt.transactionHash;
  console.log("Transaction confirmed:", hash);
  return { ...receipt, hash, ipfsHash };
}

/**
 * Fetches the audit log by querying MedicalRecordAdded events
 */
export async function fetchAuditLog(patientAddress?: string) {
  const allLogs = [...JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]')];

  if (!window.ethereum) {
    console.warn("MetaMask not detected, returning simulated logs only.");
    return allLogs;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MediChainArtifact.abi,
      provider
    );

    const filter = contract.filters.MedicalRecordAdded(patientAddress);
    const events = await contract.queryFilter(filter, -10000); // Increased range to 10k blocks

    const chainLogs = events.map(event => {
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
    });

    return [...allLogs, ...chainLogs].sort((a, b) => b.timestamp - a.timestamp);
  } catch (err) {
    console.error("Failed to fetch from blockchain, returning simulated logs:", err);
    return allLogs;
  }
}
