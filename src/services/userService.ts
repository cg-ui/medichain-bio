/**
 * Mock user service to resolve emails to wallet addresses for the demo.
 * In a production app, this would be a real backend lookup.
 */

export interface UserProfile {
  email: string;
  address: string;
  name: string;
}

const MOCK_USERS: UserProfile[] = [
  {
    email: 'sarah@medichain.bio',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    name: 'Sarah Mitchell'
  },
  {
    email: 'eleanor@medichain.bio',
    address: '0x3c2...1a9', // Mock address
    name: 'Eleanor Shellstrop'
  },
  {
    email: 'chidi@medichain.bio',
    address: '0x2A4...b998',
    name: 'Chidi Anagonye'
  }
];

export async function resolveEmailToAddress(email: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/users/resolve/${encodeURIComponent(email)}`);
    if (!response.ok) {
      // Fallback to mock for demo if API fails or user not found
      const mock = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      return mock ? mock.address : null;
    }
    const data = await response.json();
    let address = data.address;
    
    // Check for null or zero address
    if (!address || address === '0x0000000000000000000000000000000000000000') {
      // For demo purposes, if the user exists but has no wallet, 
      // generate a deterministic mock address so the simulation can proceed
      console.log("Patient found but no wallet linked. Generating demo address for simulation.");
      // Simple deterministic address from email
      const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      address = `0x${hash.toString(16).padStart(40, '0')}`.slice(0, 42);
    }
    
    return address;
  } catch (err) {
    console.error("Failed to resolve email via API, falling back to mock:", err);
    const mock = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    return mock ? mock.address : null;
  }
}

export async function getUserProfileByAddress(address: string): Promise<UserProfile | null> {
  const user = MOCK_USERS.find(u => u.address.toLowerCase() === address.toLowerCase());
  return user || null;
}
