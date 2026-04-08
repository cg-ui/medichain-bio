import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { uploadToIPFS, addRecordOnChain, simulateRecordOnChain, ensureSepoliaNetwork } from '../services/blockchainService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export function UploadModal({ isOpen, onClose, user }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [patientAddress, setPatientAddress] = useState(user?.role === 'patient' ? user?.walletAddress || '' : '');
  const [recordType, setRecordType] = useState('PDF');
  const [isSimulation, setIsSimulation] = useState(true);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'recording' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !patientAddress) {
      setError("Please provide a file and patient address.");
      return;
    }

    try {
      setStatus('uploading');
      setError('');

      // 1. Upload to IPFS
      const ipfsHash = await uploadToIPFS(file);
      
      setStatus('recording');
      
      // 2. Record on Blockchain (Real or Simulated)
      let receipt;
      if (isSimulation) {
        receipt = await simulateRecordOnChain(patientAddress, ipfsHash, recordType);
      } else {
        // Ensure we are on Sepolia before trying to send a real transaction
        await ensureSepoliaNetwork();
        receipt = await addRecordOnChain(patientAddress, ipfsHash, recordType);
        
        // Also save to local storage so it shows up in the UI immediately
        const newLog = {
          patientAddress,
          ipfsHash,
          recordType,
          timestamp: Math.floor(Date.now() / 1000),
          uploader: user?.walletAddress || "0xCurrent",
          transactionHash: receipt.hash,
          formattedDate: new Date().toLocaleString(),
          isSimulated: false,
          isPendingSync: true // Mark as pending until next blockchain sync
        };
        const saved = JSON.parse(localStorage.getItem('medichain_simulated_logs') || '[]');
        saved.unshift(newLog);
        localStorage.setItem('medichain_simulated_logs', JSON.stringify(saved.slice(0, 50)));
      }
      
      setTxHash(receipt.hash);
      setStatus('success');
      window.dispatchEvent(new CustomEvent('blockchain-update'));
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An error occurred during upload.";
      if (msg.includes("insufficient funds")) {
        msg = "Insufficient Sepolia ETH. Please get free test ETH from a faucet (e.g., sepoliafaucet.com) or use 'Simulation Mode'.";
      } else if (msg.includes("user rejected") || err.code === "ACTION_REJECTED" || err.code === 4001) {
        msg = "Transaction was canceled. You can use 'Simulation Mode' to test without signing.";
      }
      setError(msg);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-container-lowest w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/20"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Secure Upload</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X className="w-6 h-6 text-outline" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">Record Secured!</h3>
                <p className="text-sm text-outline mb-6">The medical record has been hashed and recorded on the blockchain.</p>
                <div className="bg-surface-container-low p-4 rounded-2xl mb-8">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono text-primary break-all">{txHash}</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Patient Wallet Address</label>
                  <input 
                    type="text" 
                    placeholder="0x..."
                    value={patientAddress}
                    onChange={(e) => setPatientAddress(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Record Type</label>
                    <select 
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface appearance-none"
                    >
                      <option value="PDF">PDF Report</option>
                      <option value="DICOM">DICOM Image</option>
                      <option value="LAB">Lab Result</option>
                      <option value="GEN">Genomic Data</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Uploader Role</label>
                    <div className="w-full bg-surface-container-low rounded-2xl py-4 px-6 text-outline text-sm font-bold">
                      {user?.role || 'Doctor'}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-outline-variant/30 rounded-[2rem] cursor-pointer hover:bg-surface-container-low transition-all group"
                  >
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-10 h-10 text-primary mb-2" />
                        <p className="text-sm font-bold text-on-surface">{file.name}</p>
                        <p className="text-[10px] text-outline">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-outline group-hover:text-primary mb-2 transition-colors" />
                        <p className="text-sm font-bold text-outline group-hover:text-on-surface transition-colors">Click to select file</p>
                        <p className="text-[10px] text-outline">PDF, DICOM, or ZIP (Max 50MB)</p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">Simulation Mode</p>
                      <p className="text-[10px] text-outline">Free demo on Sanctuary Network</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSimulation(!isSimulation)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      isSimulation ? "bg-primary" : "bg-outline-variant"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      isSimulation ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleUpload}
                  disabled={status !== 'idle' && status !== 'error'}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'uploading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading to IPFS...
                    </>
                  ) : status === 'recording' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Recording on Blockchain...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Finalize & Record
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
