import React, { useState, useEffect } from 'react';
import { ShieldCheck, Watch, Smartphone, RefreshCw, Plus, Lock, Info, Clock, CheckCircle2, Activity, Edit3, Copy, Check, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { EditProfileModal } from './EditProfileModal';
import { toggleEmergencyUnlockOnChain, simulateToggleEmergencyUnlock, checkEmergencyUnlock } from '@/src/services/blockchainService';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

const initialTimeline = [
  {
    date: 'OCT 24, 2023 • DIAGNOSIS',
    ref: 'Ref: #TX-4491-B',
    title: 'Acute Seasonal Allergy Response',
    description: 'Patient presented with severe respiratory irritation and dermal hives. Initial treatment via antihistamines administered by Dr. Aris Thorne.',
    hash: '0x8a2...3f1',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nd7KxcyvecyvMT99cOc7yEn1K',
    color: 'border-blue-600',
    dot: 'bg-blue-600'
  },
  {
    date: 'SEP 12, 2023 • VACCINATION',
    ref: 'Ref: #VX-0021-A',
    title: 'Influenza Type-A Annual Booster',
    description: 'Administered at Central Medical Facility. Lot number: L-88921. No adverse reactions observed during 30-minute post-injection monitoring.',
    tag: 'Verified by Clinic-09',
    hash: '0x7b1...2e4',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nd7KxcyvecyvMT99cOc7yEn1K',
    color: 'border-teal-600',
    dot: 'bg-teal-600'
  },
  {
    date: 'JUNE 05, 2023 • GENERAL CHECKUP',
    ref: 'Ref: #RX-1102-K',
    title: 'Annual Physical & Bloodwork',
    description: 'All metrics within nominal range. LDL cholesterol slightly elevated, recommended dietary adjustments.',
    hash: '0x3c2...1a9',
    ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nd7KxcyvecyvMT99cOc7yEn1K',
    color: 'border-slate-300',
    dot: 'bg-slate-300'
  }
];

export function PatientProfile() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Sarah Mitchell',
    age: '32 Years',
    bloodGroup: 'A Positive',
    dob: 'May 14, 1991'
  });
  const [timeline, setTimeline] = useState(initialTimeline);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEmergencyUnlockEnabled, setIsEmergencyUnlockEnabled] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { userAddress } = useAuth();

  useEffect(() => {
    const loadEmergencyState = async () => {
      if (userAddress) {
        const status = await checkEmergencyUnlock(userAddress);
        setIsEmergencyUnlockEnabled(status);
      }
    };
    loadEmergencyState();
  }, [userAddress]);

  const handleToggleEmergencyUnlock = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsToggling(true);
    try {
      // For demo purposes, we'll ask if they want to simulate or use MetaMask
      const useMetaMask = window.confirm("Use MetaMask for this transaction? (Cancel for simulation)");
      
      if (useMetaMask) {
        await toggleEmergencyUnlockOnChain(!isEmergencyUnlockEnabled);
      } else {
        await simulateToggleEmergencyUnlock(userAddress, !isEmergencyUnlockEnabled);
      }
      
      setIsEmergencyUnlockEnabled(!isEmergencyUnlockEnabled);
      toast.success(`Emergency Unlock ${!isEmergencyUnlockEnabled ? 'Enabled' : 'Disabled'}`);
      
      // Refresh audit log
      window.dispatchEvent(new CustomEvent('medical-history-update'));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to toggle emergency unlock");
    } finally {
      setIsToggling(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Listen for timeline updates from the FAB
  React.useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setTimeline(prev => [e.detail, ...prev]);
      }
    };
    window.addEventListener('medical-history-update', handleUpdate);
    return () => window.removeEventListener('medical-history-update', handleUpdate);
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Header Card */}
        <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 relative overflow-hidden">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-8 right-8 p-3 rounded-2xl bg-surface-container-low text-outline hover:text-primary transition-all shadow-sm"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOGRuapW-xDG1ebDn5YXuhiBCNsh_kTGWbJp_jFZjBKc0nzRY8kehrgrMba0Y5o7hpECqDbM1Ze-MH_v5eszA2GylKir4uGUENwMUtYmqEzDBIfd79U6a8BpO-2_TyRgl6-_dH9yLxpatxu_omftCgSoRvq7Oe-PmbOSp73PMHiiL21gdhF-881eUEIJPg7FjZh8Ak6uDeNyDKFUgLgVcG1MbCXnRUFsIwXUhfX4uQSG-_Ntpd6BJ3S3wLk7XIi5WZuPWac5yudoR4" 
                  alt="Sarah Mitchell" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-teal-600 border-2 border-white flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Patient Record #MC-99201</p>
                  <h2 className="text-5xl font-headline font-extrabold text-on-surface tracking-tighter">{profile.name}</h2>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Digital Signature Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Immutable Ledger
                  </span>
                </div>
              </div>
 
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Blood Group</p>
                  <p className="text-xl font-bold text-red-600">{profile.bloodGroup}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Age</p>
                  <p className="text-xl font-bold text-on-surface">{profile.age}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Date of Birth</p>
                  <p className="text-xl font-bold text-on-surface">{profile.dob}</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-outline uppercase mb-1">Last Sync</p>
                  <p className="text-xl font-bold text-on-surface">2m ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-bold text-on-surface">Medical History Timeline</h3>
            <div className="flex bg-surface-container-low p-1 rounded-full">
              <button className="px-4 py-1.5 rounded-full bg-surface-container-lowest shadow-sm text-xs font-bold">All Events</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-outline">Diagnoses</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold text-outline">Vaccinations</button>
            </div>
          </div>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={cn("absolute -left-[30px] top-2 w-6 h-6 rounded-full border-4 border-white shadow-sm z-10", item.dot)} />
                <div className={cn("bg-surface-container-lowest p-8 rounded-[2rem] border-l-4 shadow-sm", item.color)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-primary tracking-widest mb-1">{item.date}</p>
                      <h4 className="text-xl font-headline font-bold text-on-surface">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold text-outline">{item.ref}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    {item.hash ? (
                      <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg">
                        <span className="text-[10px] font-bold text-outline">Blockchain Hash:</span>
                        <span className="text-[10px] font-mono text-on-surface">{item.hash}</span>
                      </div>
                    ) : item.tag ? (
                      <div className="flex items-center gap-1.5 text-teal-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{item.tag}</span>
                      </div>
                    ) : <div />}
                    
                    {item.hash && (
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => copyToClipboard(item.ipfsHash, `timeline-${idx}`)}
                          title="Copy IPFS CID"
                          className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline relative"
                        >
                          {copiedId === `timeline-${idx}` ? <Check className="w-3 h-3 text-teal-500" /> : <Copy className="w-3 h-3" />} Copy CID
                        </button>
                        <button 
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${item.hash}`, '_blank')}
                          className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" /> View on Etherscan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* Wearables */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-headline font-bold text-on-surface">Connected Wearables</h4>
            <Smartphone className="w-5 h-5 text-outline" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low group hover:bg-surface-container-high transition-all">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                <Watch className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Apple Watch Series 8</p>
                <p className="text-[10px] text-outline font-bold">VITALS STREAMING ACTIVE</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low group hover:bg-surface-container-high transition-all">
              <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-teal-600 shadow-sm">
                <Activity className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Fitbit Luxe</p>
                <p className="text-[10px] text-outline font-bold">LAST SYNC: 1 HOUR AGO</p>
              </div>
              <RefreshCw className="w-3 h-3 text-outline" />
            </div>
            <button className="w-full py-3 border-2 border-dashed border-outline-variant/30 rounded-2xl text-outline text-xs font-bold flex items-center justify-center gap-2 hover:border-primary/30 hover:text-primary transition-all">
              <Plus className="w-4 h-4" /> Connect New Device
            </button>
          </div>
        </div>

        {/* Emergency Protocol */}
        <div className={cn(
          "p-8 rounded-[2.5rem] shadow-sm border transition-all duration-500",
          isEmergencyUnlockEnabled 
            ? "bg-red-50 border-red-200" 
            : "bg-surface-container-lowest border-outline-variant/10"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h4 className={cn(
              "font-headline font-bold",
              isEmergencyUnlockEnabled ? "text-red-900" : "text-on-surface"
            )}>Emergency Protocol</h4>
            <AlertTriangle className={cn(
              "w-5 h-5",
              isEmergencyUnlockEnabled ? "text-red-600 animate-pulse" : "text-outline"
            )} />
          </div>
          
          <p className="text-xs text-outline mb-6">
            When enabled, all your medical reports and vitals become accessible to any doctor in an emergency situation.
          </p>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 backdrop-blur-sm border border-outline-variant/10">
            <div>
              <p className="text-sm font-bold text-on-surface">Emergency Unlock</p>
              <p className="text-[10px] text-outline font-bold uppercase tracking-wider">
                {isEmergencyUnlockEnabled ? 'Global Access Active' : 'Restricted Access'}
              </p>
            </div>
            <button 
              onClick={handleToggleEmergencyUnlock}
              disabled={isToggling}
              className={cn(
                "w-12 h-6 rounded-full relative transition-all duration-300 flex items-center px-1",
                isEmergencyUnlockEnabled ? "bg-red-600" : "bg-outline-variant/30",
                isToggling && "opacity-50 cursor-not-allowed"
              )}
            >
              <motion.div 
                animate={{ x: isEmergencyUnlockEnabled ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center"
              >
                {isToggling && <Loader2 className="w-2 h-2 animate-spin text-primary" />}
              </motion.div>
            </button>
          </div>

          {isEmergencyUnlockEnabled && (
            <div className="mt-4 p-4 rounded-2xl bg-red-100/50 border border-red-200">
              <p className="text-[10px] text-red-800 font-bold leading-tight">
                CRITICAL: Your records are currently globally accessible. Disable this once the emergency is resolved.
              </p>
            </div>
          )}
        </div>

        {/* Access Sovereignty */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-headline font-bold text-on-surface">Access Sovereignty</h4>
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <p className="text-xs text-outline mb-6">Manage institutional access permissions for your clinical data ledger.</p>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">General Physicians</p>
                <p className="text-[10px] text-outline">Full historical read access</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Health Insurance</p>
                <p className="text-[10px] text-outline">Verified claims data only</p>
              </div>
              <div className="w-10 h-5 bg-surface-container-high rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-on-surface">Research Anonymity</p>
                <p className="text-[10px] text-outline">Non-PII data for science</p>
              </div>
              <div className="w-10 h-5 bg-primary rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-2xl bg-primary/5 text-primary text-xs font-bold hover:bg-primary/10 transition-all">
            Advanced Encryption Settings
          </button>
        </div>

        {/* Access Log */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <h4 className="font-headline font-bold text-on-surface mb-6">Access Log</h4>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline">
                <Plus className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">St. Mary Medical Center</p>
                <p className="text-[10px] text-outline">Read: Medical History</p>
              </div>
              <span className="text-[10px] font-bold text-outline">10:14 AM</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-outline">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">Dr. Aris Thorne</p>
                <p className="text-[10px] text-outline">Updated: Diagnosis</p>
              </div>
              <span className="text-[10px] font-bold text-outline">Yesterday</span>
            </div>
          </div>
          <button className="w-full mt-6 text-primary text-[10px] font-bold hover:underline">
            View Full Blockchain Audit Trail
          </button>
        </div>
      </div>
      
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={profile}
        onSave={(updated) => setProfile(updated)}
      />
    </div>
  );
}
