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
 * Checks if the contract is deployed on the current network
 */
export async function isContractDeployed(): Promise<boolean> {
  if (!window.ethereum) return false;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const code = await provider.getCode(CONTRACT_ADDRESS);
    return code !== '0x' && code !== '0x0';
  } catch (err) {
    return false;
  }
}

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
 * Logs a user login event on the blockchain
 */
export async function logLoginOnChain() {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  try {
    await ensureSepoliaNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Check if contract exists on this network
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x' || code === '0x0') {
      console.warn("Contract not deployed on this network, simulating login log");
      return await simulateLogLogin(await signer.getAddress());
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MediChainArtifact.abi, signer);
    const tx = await contract.logLogin();
    await tx.wait();
    
    return tx.hash;
  } catch (err) {
    console.error("Failed to log login on-chain:", err);
    throw err;
  }
}

/**
 * Simulates a login log for demo purposes
 */
export async function simulateLogLogin(userAddress: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const txHash = "0x" + Math.random().toString(16).slice(2, 10) + "...";
  
  const auditLog = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  auditLog.unshift({
    patientAddress: userAddress,
    ipfsHash: "LOGIN_EVENT",
    recordType: "User Login Verified",
    timestamp: Math.floor(Date.now() / 1000),
    uploader: userAddress,
    transactionHash: txHash,
    formattedDate: new Date().toLocaleString(),
    isSimulated: true
  });
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(auditLog));
  return txHash;
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
 * Fetches the audit log by querying multiple events from the blockchain
 */
export async function fetchAuditLog(patientAddress?: string) {
  let allLogs = [...JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]')];

  // Validate address if provided
  const isZeroAddress = patientAddress === '0x0000000000000000000000000000000000000000';
  const isValidAddress = patientAddress && ethers.isAddress(patientAddress) && !isZeroAddress;
  const filterAddress = isValidAddress ? patientAddress : null;

  // Filter simulated logs by patient address or email if provided
  if (patientAddress) {
    allLogs = allLogs.filter(log => 
      (log.patientAddress && log.patientAddress.toLowerCase() === patientAddress.toLowerCase()) ||
      (log.patientEmail && log.patientEmail.toLowerCase() === patientAddress.toLowerCase())
    );
  }

  if (!window.ethereum || isZeroAddress || !isValidAddress) {
    return allLogs;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check network first to avoid hanging on wrong network
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(11155111)) { // Sepolia
      console.warn("Not on Sepolia network, skipping blockchain log fetch");
      return allLogs;
    }

    // Check if contract exists on this network
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x' || code === '0x0') {
      console.warn("Contract not deployed on this network, skipping blockchain log fetch");
      return allLogs;
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MediChainArtifact.abi,
      provider
    );

    // Timeout helper
    const withTimeout = (promise: Promise<any>, ms: number) => 
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms))
      ]);

    console.log(`Fetching blockchain logs for ${filterAddress || 'all patients'}...`);

    // Define all filters
    const filters = [
      contract.filters.MedicalRecordAdded(filterAddress),
      contract.filters.AccessGranted(filterAddress),
      contract.filters.AccessRevoked(filterAddress),
      contract.filters.EmergencyUnlockToggled(filterAddress),
      contract.filters.EmergencyAccessGranted(filterAddress),
      contract.filters.UserLogin(filterAddress)
    ];

    // Fetch all events in parallel with a 4-second timeout (faster)
    const eventResults = await withTimeout(
      Promise.all(filters.map(f => contract.queryFilter(f, -3000))), // Last 3000 blocks for speed
      5000
    );

    const [recordEvents, grantEvents, revokeEvents, unlockEvents, eGrantEvents, loginEvents] = eventResults;

    const chainLogs = recordEvents.map(event => {
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

    const grantLogs = grantEvents.map(event => {
      const { patient, doctor, modules, expiry } = (event as any).args;
      return {
        patientAddress: patient,
        ipfsHash: "ACCESS_GRANT",
        recordType: `Access Granted: ${doctor}`,
        timestamp: Number(expiry) - 86400,
        uploader: patient,
        transactionHash: event.transactionHash,
        formattedDate: new Date((Number(expiry) - 86400) * 1000).toLocaleString()
      };
    });

    const revokeLogs = revokeEvents.map(event => {
      const { patient, doctor } = (event as any).args;
      return {
        patientAddress: patient,
        ipfsHash: "ACCESS_REVOKE",
        recordType: `Access Revoked: ${doctor}`,
        timestamp: Math.floor(Date.now() / 1000), // Fallback
        uploader: patient,
        transactionHash: event.transactionHash,
        formattedDate: new Date().toLocaleString()
      };
    });

    const unlockLogs = unlockEvents.map(event => {
      const { patient, status } = (event as any).args;
      return {
        patientAddress: patient,
        ipfsHash: "EMERGENCY_TOGGLE",
        recordType: `Emergency Unlock: ${status ? 'ENABLED' : 'DISABLED'}`,
        timestamp: Math.floor(Date.now() / 1000),
        uploader: patient,
        transactionHash: event.transactionHash,
        formattedDate: new Date().toLocaleString()
      };
    });

    const eGrantLogs = eGrantEvents.map(event => {
      const { patient, doctor, reason, expiry } = (event as any).args;
      return {
        patientAddress: patient,
        ipfsHash: "EMERGENCY_GRANT",
        recordType: `Emergency Access: ${doctor} (Reason: ${reason})`,
        timestamp: Number(expiry) - 86400,
        uploader: doctor,
        transactionHash: event.transactionHash,
        formattedDate: new Date((Number(expiry) - 86400) * 1000).toLocaleString()
      };
    });

    const loginLogs = loginEvents.map(event => {
      const { user, timestamp } = (event as any).args;
      return {
        patientAddress: user,
        ipfsHash: "LOGIN_EVENT",
        recordType: "User Login Verified",
        timestamp: Number(timestamp),
        uploader: user,
        transactionHash: event.transactionHash,
        formattedDate: new Date(Number(timestamp) * 1000).toLocaleString()
      };
    });

    return [...allLogs, ...chainLogs, ...grantLogs, ...revokeLogs, ...unlockLogs, ...eGrantLogs, ...loginLogs]
      .sort((a, b) => b.timestamp - a.timestamp);

  } catch (err) {
    console.warn("Failed to fetch from blockchain, returning simulated logs:", err);
    return allLogs;
  }
}

/**
 * Grants access to a doctor on-chain
 */
export async function grantAccessOnChain(doctorAddress: string, modules: string[], duration: number) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MediChainArtifact.abi,
    signer
  );

  console.log(`Granting access to ${doctorAddress} for ${modules.join(', ')}...`);
  
  const tx = await contract.grantAccess(doctorAddress, modules, duration);
  const receipt = await tx.wait();
  
  return receipt;
}

/**
 * Revokes access from a doctor on-chain
 */
export async function revokeAccessOnChain(doctorAddress: string) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    MediChainArtifact.abi,
    signer
  );

  console.log(`Revoking access from ${doctorAddress}...`);
  
  const tx = await contract.revokeAccess(doctorAddress);
  const receipt = await tx.wait();
  
  return receipt;
}

/**
 * Toggles emergency unlock status on-chain
 */
export async function toggleEmergencyUnlockOnChain(status: boolean) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MediChainArtifact.abi, signer);
  
  const tx = await contract.toggleEmergencyUnlock(status);
  return await tx.wait();
}

/**
 * Grants emergency access to a patient's records on-chain
 */
export async function grantEmergencyAccessOnChain(patientAddress: string, reason: string) {
  if (!window.ethereum) throw new Error("MetaMask is not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, MediChainArtifact.abi, signer);
  
  const tx = await contract.grantEmergencyAccess(patientAddress, reason);
  return await tx.wait();
}

/**
 * Checks if a patient has emergency unlock enabled
 */
export async function checkEmergencyUnlock(patientAddress: string): Promise<boolean> {
  const isZeroAddress = patientAddress === '0x0000000000000000000000000000000000000000';
  if (!window.ethereum || !ethers.isAddress(patientAddress) || isZeroAddress) {
    // Fallback to simulation state if no wallet or invalid address
    const states = JSON.parse(localStorage.getItem('medichain_emergency_states') || '{}');
    return !!states[patientAddress];
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Check if contract exists on this network
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x' || code === '0x0') {
      throw new Error("Contract not deployed on this network");
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MediChainArtifact.abi, provider);
    return await contract.emergencyUnlock(patientAddress);
  } catch (err) {
    console.warn("Error checking emergency unlock on-chain, falling back to simulation:", err);
    const states = JSON.parse(localStorage.getItem('medichain_emergency_states') || '{}');
    return !!states[patientAddress];
  }
}

/**
 * Checks if a doctor has active access to a patient's data
 */
export async function checkHasAccess(patientAddress: string, doctorAddress: string): Promise<boolean> {
  const isZeroAddress = patientAddress === '0x0000000000000000000000000000000000000000';
  if (!window.ethereum || !ethers.isAddress(patientAddress) || !ethers.isAddress(doctorAddress) || isZeroAddress) {
    // Fallback to simulation check
    const grants = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
    return grants.some((g: any) => g.doctor === doctorAddress && g.active);
  }
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Check if contract exists on this network
    const code = await provider.getCode(CONTRACT_ADDRESS);
    if (code === '0x' || code === '0x0') {
      throw new Error("Contract not deployed on this network");
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, MediChainArtifact.abi, provider);
    return await contract.hasAccess(patientAddress, doctorAddress);
  } catch (err) {
    console.warn("Error checking access on-chain, falling back to simulation:", err);
    const grants = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
    return grants.some((g: any) => g.doctor === doctorAddress && g.active);
  }
}

/**
 * Fetches all access grants for a patient
 */
export async function fetchAccessGrants(patientAddress: string) {
  const simulatedGrants = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
  
  if (!window.ethereum || !ethers.isAddress(patientAddress)) return simulatedGrants;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MediChainArtifact.abi,
      provider
    );

    const doctors = await contract.getPatientDoctors(patientAddress);
    const chainGrants = await Promise.all(doctors.map(async (doctor: string) => {
      const grant = await contract.grants(patientAddress, doctor);
      // grant is [doctor, modules[], expiry, active]
      if (grant.active && Number(grant.expiry) > Math.floor(Date.now() / 1000)) {
        return {
          doctor: grant.doctor,
          modules: grant.modules,
          expiry: Number(grant.expiry),
          active: grant.active,
          isSimulated: false
        };
      }
      return null;
    }));

    return [...simulatedGrants, ...chainGrants.filter(g => g !== null)];
  } catch (err) {
    console.error("Failed to fetch grants from blockchain:", err);
    return simulatedGrants;
  }
}

/**
 * Simulates granting access
 */
export async function simulateGrantAccess(patientAddress: string, email: string, modules: string[], duration: number) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const newGrant = {
    doctor: email, // Using email as ID for simulation
    modules,
    expiry: Math.floor(Date.now() / 1000) + duration,
    active: true,
    isSimulated: true,
    timestamp: Math.floor(Date.now() / 1000),
    transactionHash: "0x" + Math.random().toString(16).slice(2, 10) + "..."
  };

  const saved = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
  saved.unshift(newGrant);
  localStorage.setItem('medichain_access_grants', JSON.stringify(saved));

  // Also add to audit log
  const auditLog = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  auditLog.unshift({
    patientAddress: patientAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    ipfsHash: "ACCESS_GRANT",
    recordType: `Access Granted: ${email}`,
    timestamp: Math.floor(Date.now() / 1000),
    uploader: patientAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    transactionHash: newGrant.transactionHash,
    formattedDate: new Date().toLocaleString(),
    isSimulated: true
  });
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(auditLog));

  return newGrant;
}

/**
 * Simulates revoking access
 */
export async function simulateRevokeAccess(patientAddress: string, email: string) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const saved = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
  const updated = saved.filter((g: any) => g.doctor !== email);
  localStorage.setItem('medichain_access_grants', JSON.stringify(updated));

  // Add to audit log
  const auditLog = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  auditLog.unshift({
    patientAddress: patientAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    ipfsHash: "ACCESS_REVOKE",
    recordType: `Access Revoked: ${email}`,
    timestamp: Math.floor(Date.now() / 1000),
    uploader: patientAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    transactionHash: "0x" + Math.random().toString(16).slice(2, 10) + "...",
    formattedDate: new Date().toLocaleString(),
    isSimulated: true
  });
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(auditLog));
}

/**
 * Simulates toggling emergency unlock
 */
export async function simulateToggleEmergencyUnlock(patientAddress: string, status: boolean) {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const txHash = "0x" + Math.random().toString(16).slice(2, 10) + "...";
  
  const auditLog = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  auditLog.unshift({
    patientAddress,
    ipfsHash: "EMERGENCY_TOGGLE",
    recordType: `Emergency Unlock: ${status ? 'ENABLED' : 'DISABLED'}`,
    timestamp: Math.floor(Date.now() / 1000),
    uploader: patientAddress,
    transactionHash: txHash,
    formattedDate: new Date().toLocaleString(),
    isSimulated: true
  });
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(auditLog));
  
  // Store state
  const states = JSON.parse(localStorage.getItem('medichain_emergency_states') || '{}');
  states[patientAddress] = status;
  localStorage.setItem('medichain_emergency_states', JSON.stringify(states));
}

/**
 * Simulates granting emergency access
 */
export async function simulateGrantEmergencyAccess(patientAddress: string, doctorAddress: string, reason: string) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const txHash = "0x" + Math.random().toString(16).slice(2, 10) + "...";
  
  const auditLog = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
  auditLog.unshift({
    patientAddress,
    ipfsHash: "EMERGENCY_GRANT",
    recordType: `Emergency Access: ${doctorAddress || 'Unknown Doctor'} (Reason: ${reason})`,
    timestamp: Math.floor(Date.now() / 1000),
    uploader: doctorAddress || 'Unknown Doctor',
    transactionHash: txHash,
    formattedDate: new Date().toLocaleString(),
    isSimulated: true
  });
  localStorage.setItem('medichain_simulated_logs', JSON.stringify(auditLog));

  // Store access grant in simulation
  const grants = JSON.parse(localStorage.getItem('medichain_access_grants') || '[]');
  grants.unshift({
    doctor: doctorAddress,
    patient: patientAddress,
    modules: ['ALL'],
    expiry: Math.floor(Date.now() / 1000) + 86400,
    active: true,
    isSimulated: true
  });
  localStorage.setItem('medichain_access_grants', JSON.stringify(grants));
}
