import React, { useState } from 'react';
import { X, Activity, Stethoscope, Syringe, ClipboardList, Upload, FileText, CheckCircle2, Loader2, ShieldAlert, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { uploadToIPFS, simulateRecordOnChain, addRecordOnChain, ensureSepoliaNetwork } from '../services/blockchainService';

interface MedicalUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (newEntry: any) => void;
}

export function MedicalUpdateModal({ isOpen, onClose, user, onUpdate }: MedicalUpdateModalProps) {
  const [type, setType] = useState<'diagnosis' | 'vaccination' | 'general checkup'>('diagnosis');
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSimulation, setIsSimulation] = useState(true);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      setError("Please provide a title and description.");
      return;
    }

    try {
      setStatus('processing');
      setError('');

      let ipfsHash = '';
      if (file) {
        ipfsHash = await uploadToIPFS(file);
      }

      const patientAddress = user?.walletAddress || '0xSarahMitchellAddress';
      const recordType = type.toUpperCase();
      
      let receipt;
      if (isSimulation) {
        receipt = await simulateRecordOnChain(patientAddress, ipfsHash || '0xNoFile', recordType);
      } else {
        await ensureSepoliaNetwork();
        receipt = await addRecordOnChain(patientAddress, ipfsHash || '0xNoFile', recordType);
      }

      const newEntry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase() + ' • ' + recordType,
        ref: `Ref: #TX-${Math.floor(Math.random() * 9000) + 1000}-B`,
        title,
        description,
        hash: receipt.hash,
        ipfsHash: receipt.ipfsHash,
        color: type === 'diagnosis' ? 'border-blue-600' : type === 'vaccination' ? 'border-teal-600' : 'border-slate-300',
        dot: type === 'diagnosis' ? 'bg-blue-600' : type === 'vaccination' ? 'bg-teal-600' : 'bg-slate-300',
        isSimulated: isSimulation
      };

      setTxHash(receipt.hash);
      onUpdate(newEntry);
      setStatus('success');
      window.dispatchEvent(new CustomEvent('blockchain-update', { 
        detail: { 
          hash: receipt.hash, 
          ipfsHash: receipt.ipfsHash,
          recordType: type 
        } 
      }));
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "An error occurred.";
      if (msg.includes("insufficient funds")) {
        msg = "Insufficient Sepolia ETH. Use 'Simulation Mode'.";
      } else if (msg.includes("user rejected") || err.code === 4001) {
        msg = "Transaction canceled.";
      }
      setError(msg);
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-surface-container-lowest w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/20"
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <Activity className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-headline font-bold text-on-surface">Update Medical History</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X className="w-6 h-6 text-outline" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mx-auto mb-6">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">History Updated!</h3>
                <p className="text-sm text-outline mb-6">The new entry has been recorded on the blockchain.</p>
                <div className="bg-surface-container-low p-4 rounded-2xl mb-8">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono text-primary break-all">{txHash}</p>
                </div>
                <button onClick={onClose} className="w-full py-4 bg-primary text-white font-bold rounded-2xl">Done</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Update Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'diagnosis', label: 'Diagnosis', icon: Stethoscope },
                      { id: 'vaccination', label: 'Vaccination', icon: Syringe },
                      { id: 'general checkup', label: 'Checkup', icon: ClipboardList },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setType(item.id as any)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                          type === item.id 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-outline-variant/20 text-outline hover:border-outline-variant/50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Annual Physical"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-2 ml-1">Description</label>
                  <textarea 
                    placeholder="Provide details about this medical event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                  />
                </div>

                <div className="relative">
                  <input type="file" id="history-file" className="hidden" onChange={handleFileChange} />
                  <label 
                    htmlFor="history-file"
                    className="flex items-center gap-4 p-4 border-2 border-dashed border-outline-variant/30 rounded-2xl cursor-pointer hover:bg-surface-container-low transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-on-surface">{file ? file.name : "Attach Report (Optional)"}</p>
                      <p className="text-[10px] text-outline">PDF, DICOM, or Images</p>
                    </div>
                    {file && <FileText className="w-5 h-5 text-primary" />}
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">Simulation Mode</p>
                      <p className="text-[10px] text-outline">Free demo update</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSimulation(!isSimulation)}
                    className={cn("w-12 h-6 rounded-full relative transition-all", isSimulation ? "bg-primary" : "bg-outline-variant")}
                  >
                    <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", isSimulation ? "right-1" : "left-1")} />
                  </button>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handleSubmit}
                  disabled={status === 'processing'}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {status === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                  Update History
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
