import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Stethoscope, UserCog, User, Activity, Beaker, FileText, Clock, CheckCircle2, AlertCircle, History, Lock, ShieldCheck, Mail, Loader2, X, Wallet, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { fetchAccessGrants, grantAccessOnChain, revokeAccessOnChain, simulateGrantAccess, simulateRevokeAccess, fetchAuditLog } from '../services/blockchainService';
import { useMetaMask } from '../hooks/useMetaMask';

const DURATION_MAP: Record<string, number> = {
  '24h': 86400,
  '7 Days': 604800,
  '30 Days': 2592000,
  'Indefinite': 315360000 // 10 years
};

const DATA_MODULES = [
  { id: 'vitals', icon: Activity, label: 'Vitals & Monitoring', desc: 'Real-time heart rate, BP, and SPO2 logs' },
  { id: 'lab', icon: Beaker, label: 'Lab Results', desc: 'Bloodwork, DNA sequencing, and pathology' },
  { id: 'history', icon: FileText, label: 'Clinical History', desc: 'Past diagnosis and surgical records' }
];

export function AccessControl() {
  const { walletAddress } = useMetaMask();
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [email, setEmail] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(['vitals', 'lab']);
  const [duration, setDuration] = useState('7 Days');
  const [activeGrants, setActiveGrants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGranting, setIsGranting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [grantToRevoke, setGrantToRevoke] = useState<any>(null);
  const [grantMethod, setGrantMethod] = useState<'simulation' | 'metamask' | null>(null);
  const [revokeMethod, setRevokeMethod] = useState<'simulation' | 'metamask' | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [grants, logs] = await Promise.all([
        fetchAccessGrants(walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"),
        fetchAuditLog(walletAddress || undefined)
      ]);
      setActiveGrants(grants);
      setAuditLogs(logs.filter((l: any) => l.ipfsHash === 'ACCESS_GRANT' || l.ipfsHash === 'ACCESS_REVOKE').slice(0, 5));
    } catch (err) {
      console.error("Failed to load access data:", err);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleModule = (id: string) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleGrantClick = () => {
    if (!email) {
      alert("Please enter an email or wallet address.");
      return;
    }
    if (selectedModules.length === 0) {
      alert("Please select at least one data module.");
      return;
    }
    setShowConfirmModal(true);
  };

  const executeGrant = async (method: 'simulation' | 'metamask') => {
    setGrantMethod(method);
    setIsGranting(true);
    try {
      const durationSeconds = DURATION_MAP[duration];
      const currentPatient = walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
      // 1. Backend Grant (for isolation enforcement)
      try {
        await fetch('/api/access/grant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorEmail: email,
            modules: selectedModules,
            durationSeconds,
            isEmergency: false
          })
        });
      } catch (backendErr) {
        console.error("Failed to save grant to backend:", backendErr);
      }

      // 2. Blockchain Grant
      if (method === 'metamask') {
        const targetAddress = email.startsWith('0x') ? email : "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
        await grantAccessOnChain(targetAddress, selectedModules, durationSeconds);
      } else {
        await simulateGrantAccess(currentPatient, email, selectedModules, durationSeconds);
      }
      
      setEmail('');
      setShowConfirmModal(false);
      await loadData();
      window.dispatchEvent(new CustomEvent('blockchain-update'));
    } catch (err: any) {
      alert(`Grant failed: ${err.message}`);
    } finally {
      setIsGranting(false);
      setGrantMethod(null);
    }
  };

  const handleRevokeClick = (grant: any) => {
    setGrantToRevoke(grant);
    setShowRevokeModal(true);
  };

  const executeRevoke = async (method: 'simulation' | 'metamask') => {
    if (!grantToRevoke) return;
    setRevokeMethod(method);
    setIsRevoking(true);
    try {
      const currentPatient = walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";
      
      // 1. Backend Revoke
      try {
        await fetch('/api/access/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorEmail: grantToRevoke.doctor
          })
        });
      } catch (backendErr) {
        console.error("Failed to revoke from backend:", backendErr);
      }

      // 2. Blockchain Revoke
      if (method === 'metamask') {
        await revokeAccessOnChain(grantToRevoke.doctor);
      } else {
        await simulateRevokeAccess(currentPatient, grantToRevoke.doctor);
      }
      setShowRevokeModal(false);
      setGrantToRevoke(null);
      await loadData();
      window.dispatchEvent(new CustomEvent('blockchain-update'));
    } catch (err: any) {
      alert(`Revoke failed: ${err.message}`);
    } finally {
      setIsRevoking(false);
      setRevokeMethod(null);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Main Config Card */}
        <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Configure Active Consent</h2>
              <p className="text-outline font-medium">Define granular blockchain permissions for medical providers.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> SECURED BY SMART CONTRACT
            </div>
          </div>

          <div className="space-y-10">
            {/* Role Selection */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Grant Access to Role</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'doctor', icon: Stethoscope, label: 'Doctor' },
                  { id: 'patient', icon: User, label: 'Patient' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 gap-3",
                      selectedRole === role.id 
                        ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                        : "border-outline-variant/20 text-outline hover:border-outline-variant/50"
                    )}
                  >
                    <role.icon className="w-8 h-8" />
                    <span className="font-bold">{role.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Provider Identity</p>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Doctor's Email or Wallet Address"
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                />
              </div>
            </div>

            {/* Data Modules */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Select Data Modules</p>
              <div className="space-y-3">
                {DATA_MODULES.map((module) => (
                  <div 
                    key={module.id} 
                    onClick={() => toggleModule(module.id)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl transition-all cursor-pointer",
                      selectedModules.includes(module.id) ? "bg-primary/5 border border-primary/20" : "bg-surface-container-low hover:bg-surface-container-high"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-colors",
                        selectedModules.includes(module.id) ? "bg-primary text-white" : "bg-surface-container-lowest text-primary"
                      )}>
                        <module.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{module.label}</p>
                        <p className="text-xs text-outline">{module.desc}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      selectedModules.includes(module.id) ? "bg-primary" : "bg-outline-variant/30"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-surface-container-lowest rounded-full transition-all",
                        selectedModules.includes(module.id) ? "right-1" : "left-1"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Time-Bound Duration</p>
              <div className="flex gap-3">
                {Object.keys(DURATION_MAP).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "flex-1 py-3 rounded-full font-bold text-sm transition-all",
                      duration === d 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-surface-container-lowest border border-outline-variant/20 text-outline hover:bg-surface-container-low"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGrantClick}
              className="w-full py-5 rounded-3xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
            >
              <ShieldCheck className="w-6 h-6" />
              Execute Immutable Grant
            </motion.button>
          </div>
        </div>

        {/* Bottom Info Cards */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Lock, title: 'Sovereign Control', desc: 'You retain full encryption keys. No provider can view data without your specific smart contract authorization.' },
            { icon: Clock, title: 'Timed Decay', desc: 'Permissions automatically dissolve after the set period, ensuring no permanent "backdoors" exist in your record.' },
            { icon: History, title: 'Immutable Audit', desc: 'Every access request is logged on the chain. Any unauthorized attempt triggers immediate biometric alert.' }
          ].map((card, idx) => (
            <div key={idx} className="bg-surface-container-low p-6 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center">
                <card.icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-on-surface mb-2">{card.title}</h4>
                <p className="text-[11px] text-outline leading-relaxed">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-8">
        {/* Active Contracts */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-primary" />
            <h4 className="font-headline font-bold text-on-surface">Active Contracts</h4>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-outline">
                <Loader2 className="w-8 h-8 animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Ledger...</p>
              </div>
            ) : activeGrants.length > 0 ? (
              activeGrants.map((grant, idx) => (
                <div key={idx} className="p-5 rounded-3xl border-2 border-primary bg-primary/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">ACTIVE</span>
                    <span className="text-[10px] font-mono text-outline">
                      {grant.doctor.length > 15 ? `${grant.doctor.slice(0, 6)}...${grant.doctor.slice(-4)}` : grant.doctor}
                    </span>
                  </div>
                  <p className="font-bold text-on-surface truncate">{grant.doctor}</p>
                  <div className="flex flex-wrap gap-1 mt-2 mb-4">
                    {grant.modules.map((m: string) => (
                      <span key={m} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-outline uppercase">{m}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                      Expires {new Date(grant.expiry * 1000).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleRevokeClick(grant)}
                      className="text-[10px] font-bold text-red-500 hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                  {grant.isSimulated && (
                    <div className="absolute top-0 right-0">
                       <span className="text-[8px] font-bold px-2 py-0.5 bg-primary/20 text-primary rounded-bl-lg">SIMULATED</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-surface-container-low/30 rounded-3xl border border-dashed border-outline-variant/30">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">No Active Grants</p>
              </div>
            )}
          </div>
        </div>

        {/* Access Audit */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-8">
            <History className="w-5 h-5 text-primary" />
            <h4 className="font-headline font-bold text-on-surface">Access Audit</h4>
          </div>
          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, idx) => (
                <div key={idx} className="relative">
                  <div className={cn(
                    "absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 flex items-center justify-center",
                    log.ipfsHash === 'ACCESS_GRANT' ? "bg-teal-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {log.ipfsHash === 'ACCESS_GRANT' ? <ShieldCheck className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline mb-1">{log.formattedDate}</p>
                    <p className="text-sm font-bold text-on-surface leading-tight">{log.recordType}</p>
                    <p className="text-[10px] text-outline font-mono truncate">{log.transactionHash}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-outline text-center py-4">No recent access events.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGranting && setShowConfirmModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[3rem] shadow-2xl p-10 border border-outline-variant/10"
            >
              <button 
                onClick={() => setShowConfirmModal(false)}
                disabled={isGranting}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-6">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Confirm Access Grant</h3>
                <p className="text-outline font-medium mt-2">Choose your execution environment for this immutable record.</p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeGrant('simulation')}
                  disabled={isGranting}
                  className={cn(
                    "w-full p-6 rounded-3xl border-2 flex items-center gap-5 transition-all text-left group",
                    grantMethod === 'simulation' ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:border-primary/30"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Database className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-lg">Local Simulation</p>
                    <p className="text-xs text-outline">Instant processing. Perfect for testing and demo purposes.</p>
                  </div>
                  {isGranting && grantMethod === 'simulation' && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                </button>

                <button 
                  onClick={() => executeGrant('metamask')}
                  disabled={isGranting}
                  className={cn(
                    "w-full p-6 rounded-3xl border-2 flex items-center gap-5 transition-all text-left group",
                    grantMethod === 'metamask' ? "border-primary bg-primary/5" : "border-outline-variant/20 hover:border-primary/30"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-lg">Sepolia Ethereum</p>
                    <p className="text-xs text-outline">Real blockchain transaction. Requires MetaMask and Sepolia ETH.</p>
                  </div>
                  {isGranting && grantMethod === 'metamask' && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                </button>
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-outline leading-relaxed">
                    Once executed, this permission is etched into the MediChain ledger. You can revoke it at any time, but the history of the grant remains immutable.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {showRevokeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isRevoking && setShowRevokeModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-lowest rounded-[3rem] shadow-2xl p-10 border border-outline-variant/10"
            >
              <button 
                onClick={() => setShowRevokeModal(false)}
                disabled={isRevoking}
                className="absolute top-8 right-8 p-2 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight">Revoke Access</h3>
                <p className="text-outline font-medium mt-2">
                  You are about to terminate access for <span className="text-on-surface font-bold">{grantToRevoke?.doctor}</span>.
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeRevoke('simulation')}
                  disabled={isRevoking}
                  className={cn(
                    "w-full p-6 rounded-3xl border-2 flex items-center gap-5 transition-all text-left group",
                    revokeMethod === 'simulation' ? "border-red-500 bg-red-500/5" : "border-outline-variant/20 hover:border-red-500/30"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Database className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-lg">Local Simulation</p>
                    <p className="text-xs text-outline">Instant revocation in the local environment.</p>
                  </div>
                  {isRevoking && revokeMethod === 'simulation' && <Loader2 className="w-6 h-6 animate-spin text-red-500" />}
                </button>

                <button 
                  onClick={() => executeRevoke('metamask')}
                  disabled={isRevoking}
                  className={cn(
                    "w-full p-6 rounded-3xl border-2 flex items-center gap-5 transition-all text-left group",
                    revokeMethod === 'metamask' ? "border-red-500 bg-red-500/5" : "border-outline-variant/20 hover:border-red-500/30"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Wallet className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface text-lg">Sepolia Ethereum</p>
                    <p className="text-xs text-outline">Execute on-chain revocation. Requires MetaMask confirmation.</p>
                  </div>
                  {isRevoking && revokeMethod === 'metamask' && <Loader2 className="w-6 h-6 animate-spin text-red-500" />}
                </button>
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-red-50 border border-red-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-red-700 leading-relaxed">
                    Revocation is immediate. The provider will lose all access to your medical modules as soon as the transaction is confirmed.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
