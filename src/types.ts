export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
  email: string;
  role: UserRole;
  name: string;
  walletAddress?: string | null;
  age?: string;
  bloodGroup?: string;
  dob?: string;
  isDemo?: boolean;
}

export interface AuditLogEntry {
  patientAddress: string;
  ipfsHash: string;
  recordType: string;
  timestamp: number;
  uploader: string;
  transactionHash: string;
  formattedDate: string;
  isSimulated?: boolean;
  patientEmail?: string;
}

export interface PrivacyBackupRecord {
  patientAddress: string;
  recordType: string;
  fileName: string;
  ipfsHash: string;
  cloudProvider: string;
  timestamp: number;
  syntheticSummary?: string;
}
