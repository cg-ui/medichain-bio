import React, { useState } from 'react';
import { Shield, Activity, Lock, Clock, UserPlus, MoreVertical, BarChart2, ChevronLeft, ChevronRight, Zap, History, FileCheck, AlertTriangle, Search, Loader2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { checkEmergencyUnlock, grantEmergencyAccessOnChain, simulateGrantEmergencyAccess, checkHasAccess } from '@/src/services/blockchainService';
import { toast } from 'sonner';
import { useAuth } from '@/src/context/AuthContext';
import { ethers } from 'ethers';

const patients = [
  {
    id: 'ES',
    name: 'Eleanor Shellstrop',
    hash: '0x71C...4e21',
    status: 'Optimal',
    statusColor: 'bg-green-500',
    lastSync: '14 mins ago',
    block: 'Block #18,294,002',
    access: 'FULL CLINICAL',
    accessColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  },
  {
    id: 'CM',
    name: 'Chidi Anagonye',
    hash: '0x2A4...b998',
    status: 'Review Required',
    statusColor: 'bg-amber-500',
    lastSync: '2 hours ago',
    block: 'Block #18,293,891',
    access: 'READ ONLY',
    accessColor: 'bg-surface-container-high text-outline-variant'
  },
  {
    id: 'TA',
    name: 'Tahani Al-Jamil',
    hash: '0xFE2...c112',
    status: 'Critical',
    statusColor: 'bg-red-500',
    lastSync: 'Just now',
    block: 'Block #18,294,015',
    access: 'EMERGENCY ACCESS',
    accessColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'JL',
    name: 'Jason Mendoza',
    hash: '0x981...003a',
    status: 'Optimal',
    statusColor: 'bg-green-500',
    lastSync: '3 days ago',
    block: 'Block #18,290,112',
    access: 'FULL CLINICAL',
    accessColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  }
];

export function ProviderPanel() {
  const [patientEmail, setPatientEmail] = useState('');
  const [patientAddress, setPatientAddress] = useState('');
  const [reason, setReason] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState<{
    unlocked: boolean;
    hasAccess: boolean;
    checked: boolean;
  } | null>(null);
  const { userAddress } = useAuth();

  const handleCheckAccess = async () => {
    if (!patientAddress || !ethers.isAddress(patientAddress)) {
      toast.error("Please enter a valid patient wallet address");
      return;
    }

    setIsChecking(true);
    try {
      const unlocked = await checkEmergencyUnlock(patientAddress);
      const hasAccess = await checkHasAccess(patientAddress, userAddress || '');
      
      setEmergencyStatus({
        unlocked,
        hasAccess,
        checked: true
      });

      if (unlocked || hasAccess) {
        toast.success("Access verified! You can now view the patient's reports.");
      } else {
        toast.info("Patient has not enabled emergency unlock. You may request temporary access.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to check emergency status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRequestEmergencyAccess = async () => {
    if (!patientAddress || !reason) {
      toast.error("Please provide patient address and a valid reason");
      return;
    }

    setIsRequesting(true);
    try {
      const useMetaMask = window.confirm("Confirm emergency access request on-chain? (Cancel for simulation)");
      
      if (useMetaMask) {
        await grantEmergencyAccessOnChain(patientAddress, reason);
      } else {
        await simulateGrantEmergencyAccess(patientAddress, userAddress || '', reason);
      }
      
      toast.success("Emergency access granted for 24 hours");
      setEmergencyStatus(prev => prev ? { ...prev, hasAccess: true } : null);
      
      // Notify patient (simulated)
      console.log(`Notification sent to patient ${patientAddress}: Doctor ${userAddress} accessed your records via emergency protocol.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to request emergency access");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Emergency Access Portal */}
      <div className="bg-red-50 border border-red-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-headline font-bold text-red-900">Emergency Access Portal</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm text-red-800 font-medium">Access patient records directly if they have enabled Emergency Unlock, or request temporary 24-hour access.</p>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input 
                type="text"
                placeholder="Enter Patient Wallet Address (0x...)"
                value={patientAddress}
                onChange={(e) => setPatientAddress(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>

            <button 
              onClick={handleCheckAccess}
              disabled={isChecking}
              className="w-full py-3 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              Check Emergency Status
            </button>
          </div>

          {emergencyStatus?.checked && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-red-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">Status Report</span>
                {emergencyStatus.unlocked ? (
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">UNLOCKED</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">LOCKED</span>
                )}
              </div>

              {emergencyStatus.unlocked || emergencyStatus.hasAccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-sm font-bold text-green-900">Access Granted</p>
                    <p className="text-xs text-green-700">You have active permission to view this patient's records.</p>
                  </div>
                  <button 
                    onClick={() => window.location.href = `/reports?patient=${patientAddress}`}
                    className="w-full py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-all"
                  >
                    View Patient Reports
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-sm font-bold text-amber-900">Access Restricted</p>
                    <p className="text-xs text-amber-700">Provide a reason to request 24-hour emergency access.</p>
                  </div>
                  <textarea 
                    placeholder="Reason for emergency access (e.g., Unconscious patient, Trauma)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full p-4 rounded-xl bg-surface-container-low border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                  />
                  <button 
                    onClick={handleRequestEmergencyAccess}
                    disabled={isRequesting}
                    className="w-full py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                    Execute Emergency Grant
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <p className="text-outline text-sm font-medium mb-2">Active Medical Authority</p>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface mb-6">Sovereign Node #442</h2>
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i+10}/100/100`} alt="Node member" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-xs font-bold">+12</div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> Synchronized
            </div>
          </div>
        </div>

        <div className="bg-primary p-8 rounded-3xl shadow-lg shadow-primary/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/70 text-sm font-medium mb-2">Encryption Health</p>
            <h2 className="text-5xl font-headline font-extrabold mb-6">99.9%</h2>
            <p className="text-xs font-bold tracking-widest uppercase opacity-70">AES-256 Quantum Resistant</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <p className="text-outline text-sm font-medium mb-2">Pending Requests</p>
          <h2 className="text-5xl font-headline font-extrabold text-on-surface mb-6">07</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Review Access <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-8 flex items-center justify-between border-b border-outline-variant/10">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface">Authorized Patients</h3>
            <p className="text-outline text-sm">Manage clinical access and monitor patient health indices.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-surface-container-low p-1 rounded-full">
              <button className="px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm text-xs font-bold">All</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-outline">Critical</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-outline">Stable</button>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-secondary-container text-on-secondary-container font-bold text-sm shadow-sm hover:shadow-md transition-all">
              <UserPlus className="w-4 h-4" /> Request Access
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-outline border-b border-outline-variant/10">
                <th className="px-8 py-4">Patient Name</th>
                <th className="px-8 py-4">Health Status</th>
                <th className="px-8 py-4">Last Sync</th>
                <th className="px-8 py-4">Access Level</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {patients.map((patient) => (
                <tr key={patient.id} className="group hover:bg-surface-container-low transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {patient.id}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{patient.name}</p>
                        <p className="text-[10px] font-mono text-outline">{patient.hash}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", patient.statusColor)} />
                      <span className="text-sm font-semibold text-on-surface-variant">{patient.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{patient.lastSync}</p>
                      <p className="text-[10px] text-outline">{patient.block}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn("text-[10px] px-3 py-1 rounded-full font-bold", patient.accessColor)}>
                      {patient.access}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors">
                        <BarChart2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-surface-container-high text-outline transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 flex items-center justify-between border-t border-outline-variant/10">
          <p className="text-xs text-outline font-medium">Displaying 4 of 128 authorized ledger entries</p>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg border border-outline-variant/20 text-outline hover:bg-surface-container-low transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 flex items-center gap-4 group hover:border-primary/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">AI Diagnostics Ready</h4>
            <p className="text-xs text-outline">Symptom pattern analysis available for 3 new records.</p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 flex items-center gap-4 group hover:border-secondary/20 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Ledger Audit Trail</h4>
            <p className="text-xs text-outline">Verification success for all 0x-prefixed medical hashes.</p>
          </div>
        </div>
        <div className="bg-tertiary p-6 rounded-3xl text-white flex items-center gap-4 group relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white relative z-10">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h4 className="font-bold">New Policy Proposal</h4>
            <p className="text-xs opacity-70">Universal HIPAA 2.0 consensus reached by network nodes.</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        </div>
      </div>
    </div>
  );
}
