import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Droplets, AlertTriangle, Activity, Smartphone, Link, Download, Phone, ChevronRight, Lock, Loader2, ShieldCheck, RefreshCw, Search, Mail, User, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { checkEmergencyUnlock, toggleEmergencyUnlockOnChain, simulateToggleEmergencyUnlock, fetchAuditLog, grantEmergencyAccessOnChain, simulateGrantEmergencyAccess, checkHasAccess, isContractDeployed } from '@/src/services/blockchainService';
import { resolveEmailToAddress } from '@/src/services/userService';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

export function Emergency() {
  const { user, userAddress } = useAuth();
  const isDoctor = user?.role === 'doctor';

  // Patient State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [isContractDetected, setIsContractDetected] = useState(true);
  
  // Doctor State
  const [patientEmail, setPatientEmail] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [reason, setReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [doctorAccessStatus, setDoctorAccessStatus] = useState<{
    unlocked: boolean;
    hasAccess: boolean;
    checked: boolean;
  } | null>(null);

  // Common State
  const [blockchainLogs, setBlockchainLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const loadPatientStatus = useCallback(async () => {
    if (!userAddress || isDoctor) return;
    try {
      const status = await checkEmergencyUnlock(userAddress);
      setIsEmergencyActive(status);
    } catch (err) {
      console.error("Failed to check emergency status:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, isDoctor]);

  const loadLogs = useCallback(async (showLoading = true) => {
    const targetAddress = isDoctor ? resolvedAddress : userAddress;
    if (!targetAddress) {
      setLoadingLogs(false);
      return;
    }
    
    try {
      if (showLoading) setLoadingLogs(true);
      const logs = await fetchAuditLog(targetAddress);
      // Filter to only show emergency-related transactions in this section
      const emergencyLogs = logs.filter(log => 
        log.recordType.includes('Emergency') || 
        log.recordType.includes('Override')
      );
      setBlockchainLogs(emergencyLogs);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [userAddress, resolvedAddress, isDoctor]);

  useEffect(() => {
    const init = async () => {
      const deployed = await isContractDeployed();
      setIsContractDetected(deployed);
      
      if (!isDoctor) {
        loadPatientStatus();
      } else {
        setIsLoading(false);
      }
      loadLogs();
    };
    init();
  }, [loadPatientStatus, loadLogs, isDoctor]);

  const handleToggleEmergency = async () => {
    if (!userAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsToggling(true);
    const newStatus = !isEmergencyActive;
    
    try {
      const useMetaMask = window.confirm(`Confirm ${newStatus ? 'ENABLING' : 'DISABLING'} Emergency Unlock on-chain? (Cancel for simulation)`);
      
      if (useMetaMask) {
        await toggleEmergencyUnlockOnChain(newStatus);
      } else {
        await simulateToggleEmergencyUnlock(userAddress, newStatus);
      }

      setIsEmergencyActive(newStatus);
      toast.success(`Emergency Protocol ${newStatus ? 'Activated' : 'Secured'}`);
      loadLogs(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to toggle emergency status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleSearchPatient = async () => {
    if (!patientEmail) {
      toast.error("Please enter a patient email");
      return;
    }

    setIsResolving(true);
    setDoctorAccessStatus(null);
    try {
      const address = await resolveEmailToAddress(patientEmail);
      if (!address) {
        toast.error("Patient not found in MediChain directory");
        setResolvedAddress(null);
        setIsResolving(false);
        return;
      }

      setResolvedAddress(address);
      
      // Check if it's a mock address (starts with 0x000... but not all zeros)
      const isMock = address.startsWith('0x0000') && address !== '0x0000000000000000000000000000000000000000';
      if (isMock) {
        toast.info("Patient found (Demo Mode). Proceeding with simulated wallet.");
      }
      const unlocked = await checkEmergencyUnlock(address);
      const hasAccess = await checkHasAccess(address, userAddress || '');
      
      setDoctorAccessStatus({
        unlocked,
        hasAccess,
        checked: true
      });

      if (unlocked || hasAccess) {
        toast.success("Access verified! You can now view the patient's reports.");
      } else {
        toast.info("Patient has not enabled emergency unlock. You may request temporary access.");
      }
      
      // Load logs for this patient
      const logs = await fetchAuditLog(address);
      const emergencyLogs = logs.filter(log => 
        log.recordType.includes('Emergency') || 
        log.recordType.includes('Override')
      );
      setBlockchainLogs(emergencyLogs);

    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve patient address");
    } finally {
      setIsResolving(false);
    }
  };

  const handleRequestEmergencyAccess = async () => {
    if (!resolvedAddress || !reason) {
      toast.error("Please provide a valid reason for access");
      return;
    }

    setIsRequesting(true);
    try {
      const useMetaMask = window.confirm("Confirm emergency access request on-chain? (Cancel for simulation)");
      
      if (useMetaMask) {
        await grantEmergencyAccessOnChain(resolvedAddress, reason);
      } else {
        await simulateGrantEmergencyAccess(resolvedAddress, userAddress || '', reason);
      }
      
      // Simulated notification to patient
      const doctorId = userAddress || user?.email || 'Unknown Doctor';
      const patientId = resolvedAddress || 'Unknown Patient';
      console.log(`Notification sent to patient ${patientId}: Doctor ${doctorId} accessed your records via emergency protocol.`);
      
      toast.success("Emergency access granted for 24 hours");
      setDoctorAccessStatus(prev => prev ? { ...prev, hasAccess: true } : null);
      
      // Refresh logs
      loadLogs(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to request emergency access");
    } finally {
      setIsRequesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Role-based Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">
            {isDoctor ? 'Emergency Access Portal' : 'Emergency Protocol'}
          </h2>
          <p className="text-outline font-medium">
            {isDoctor 
              ? 'Securely access patient records in critical situations.' 
              : 'Manage your global emergency unlock status and audit access.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isContractDetected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Simulation Mode</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-100">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">High Priority Node</span>
          </div>
        </div>
      </div>

      {/* Patient View: Emergency Banner */}
      {!isDoctor && (
        <AnimatePresence>
          {isEmergencyActive && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border-l-4 border-red-600 p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-red-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-red-900">Emergency Protocol Active</h3>
                  <p className="text-sm text-red-700">Blockchain-recorded biometric unlock is currently broadcasted to the network.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-red-600 bg-red-100 px-3 py-1.5 rounded-full font-bold">LIVE BROADCAST</span>
                <button 
                  onClick={handleToggleEmergency}
                  disabled={isToggling}
                  className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Secure Records
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Doctor View: Patient Search */}
      {isDoctor && (
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">Patient Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                <input 
                  type="email"
                  placeholder="patient@medichain.bio"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all outline-none text-sm"
                />
              </div>
            </div>
            <button 
              onClick={handleSearchPatient}
              disabled={isResolving}
              className="px-8 py-4 rounded-2xl bg-red-600 text-white font-bold flex items-center gap-3 hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {isResolving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Identify Patient
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Secure Unlock (Patient) or Access Status (Doctor) */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          {!isDoctor ? (
            <>
              <div className="relative mb-8">
                <div className={cn(
                  "w-48 h-48 rounded-full border-8 flex items-center justify-center transition-all duration-500",
                  isEmergencyActive ? "border-red-100" : "border-surface-container-low"
                )}>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleEmergency}
                    disabled={isToggling}
                    className={cn(
                      "w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-500",
                      isEmergencyActive ? "bg-red-600 shadow-red-600/40" : "bg-surface-container-highest text-outline shadow-none hover:bg-red-500 hover:text-white"
                    )}
                  >
                    {isToggling ? (
                      <Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                      <>
                        {isEmergencyActive ? <ShieldAlert className="w-10 h-10 mb-2" /> : <Lock className="w-10 h-10 mb-2" />}
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {isEmergencyActive ? 'Protocol Active' : 'Secure Unlock'}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
                {isEmergencyActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-red-600/20 animate-ping" />
                )}
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-2">
                {isEmergencyActive ? 'Emergency Mode' : 'Biometric Vault'}
              </h3>
              <p className="text-sm text-outline max-w-[240px]">
                {isEmergencyActive 
                  ? 'Your medical records are currently accessible to authorized clinical nodes globally.'
                  : 'One-tap cryptographic consent override for first responders. Transaction signed via biometric vault.'}
              </p>
            </>
          ) : (
            <div className="w-full space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-600 mx-auto mb-4">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-headline font-extrabold text-on-surface">Access Status</h3>
              
              {!doctorAccessStatus ? (
                <p className="text-sm text-outline">Identify a patient to check their emergency access status.</p>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl border flex items-center gap-3",
                    doctorAccessStatus.unlocked || doctorAccessStatus.hasAccess 
                      ? "bg-green-50 border-green-200 text-green-700" 
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  )}>
                    {doctorAccessStatus.unlocked || doctorAccessStatus.hasAccess 
                      ? <ShieldCheck className="w-5 h-5" /> 
                      : <AlertCircle className="w-5 h-5" />}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {doctorAccessStatus.unlocked || doctorAccessStatus.hasAccess ? 'Access Granted' : 'Access Restricted'}
                    </span>
                  </div>

                  {doctorAccessStatus.unlocked || doctorAccessStatus.hasAccess ? (
                    <button 
                      onClick={() => window.location.href = `/reports?patient=${resolvedAddress}`}
                      className="w-full py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Patient Reports
                    </button>
                  ) : (
                    <div className="space-y-4 text-left">
                      <p className="text-xs text-outline font-medium">Patient has not enabled global unlock. Provide a clinical justification for 24-hour access.</p>
                      <textarea 
                        placeholder="Reason for emergency access..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-sm focus:border-red-500 outline-none min-h-[120px]"
                      />
                      <button 
                        onClick={handleRequestEmergencyAccess}
                        disabled={isRequesting}
                        className="w-full py-4 rounded-2xl bg-red-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
                        Execute Emergency Grant
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Vitals & Info (Only for Patient or if Doctor has access) */}
        <div className="lg:col-span-2 space-y-8">
          {(!isDoctor || (doctorAccessStatus?.unlocked || doctorAccessStatus?.hasAccess)) ? (
            <>
              <div className="grid grid-cols-2 gap-6">
                {/* Blood Group */}
                <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-2">Blood Group</p>
                    <h2 className="text-5xl font-headline font-extrabold text-on-surface">A+</h2>
                    <p className="text-[10px] text-outline mt-2">Verified via Lab Corp 02/24</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Droplets className="w-6 h-6 fill-current" />
                  </div>
                </div>

                {/* Allergies */}
                <div className="bg-red-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Severe Allergies</p>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h2 className="text-3xl font-headline font-extrabold mb-4">Penicillin, Peanuts</h2>
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold">Protocol: <span className="font-normal opacity-80">Use alternative cephalosporins.</span></p>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                </div>
              </div>

              {/* Live Vitals */}
              <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <h4 className="font-headline font-bold text-on-surface">Live Patient Vitals</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Syncing with IOT Hub</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-12">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Heart Rate</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-extrabold text-on-surface">74</span>
                      <span className="text-xs font-bold text-outline">BPM</span>
                    </div>
                    <div className="mt-4 h-1 bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[70%]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">SPO2</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-extrabold text-on-surface">98</span>
                      <span className="text-xs font-bold text-outline">%</span>
                    </div>
                    <div className="mt-4 h-1 bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[98%]" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">BP</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-extrabold text-on-surface">120/80</span>
                      <span className="text-xs font-bold text-outline">mmHg</span>
                    </div>
                    <div className="mt-4 h-1 bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[80%]" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-surface-container-low/30 rounded-[3rem] border border-dashed border-outline-variant/20">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-6">
                <Lock className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-headline font-bold text-on-surface mb-2">Clinical Data Locked</h4>
              <p className="text-sm text-outline max-w-sm">Patient vitals and medical history are encrypted. Access must be granted via global unlock or emergency override.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Access Ledger */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h4 className="font-headline font-bold text-on-surface">Immutable Access Ledger</h4>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => loadLogs()}
                className="p-2 rounded-lg hover:bg-surface-container-low text-outline transition-all"
              >
                <RefreshCw className={cn("w-4 h-4", loadingLogs && "animate-spin")} />
              </button>
              <button className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline">
                View Explorer <Link className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {loadingLogs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-outline" />
              </div>
            ) : blockchainLogs.length > 0 ? (
              blockchainLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5 group hover:bg-surface-container-low transition-all">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm",
                    log.recordType.includes('Emergency') ? "bg-red-50 text-red-600" : "bg-white text-primary"
                  )}>
                    {log.recordType.includes('Emergency') ? <ShieldAlert className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">{log.recordType}</p>
                    <p className="text-[10px] text-outline font-mono truncate max-w-[200px]">{log.transactionHash}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface">{log.formattedDate}</p>
                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Verified</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-outline-variant/30 rounded-2xl">
                <p className="text-sm font-bold text-outline">No access events recorded on-chain.</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Profile Ready - Only available during emergency */}
        {((!isDoctor && isEmergencyActive) || (isDoctor && (doctorAccessStatus?.unlocked || doctorAccessStatus?.hasAccess))) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-low p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <Download className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-headline font-bold text-on-surface mb-2">Clinical Profile Ready</h4>
            <p className="text-xs text-outline mb-8 leading-relaxed">Patient identification, medical history, and current medications are decrypted and available for viewing.</p>
            <button className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
              Download Full Briefing
            </button>
          </motion.div>
        )}
      </div>

      {/* Floating Call Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-red-600 text-white shadow-xl shadow-red-600/30 flex items-center justify-center z-50"
      >
        <Phone className="w-8 h-8 fill-current" />
      </motion.button>
    </div>
  );
}
