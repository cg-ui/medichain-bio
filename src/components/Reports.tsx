import React, { useState, useEffect, useCallback } from 'react';
import { Download, Calendar, Activity, AlertCircle, Lightbulb, ExternalLink, ShieldCheck, Loader2, RefreshCw, BrainCircuit, AlertTriangle, Info as InfoIcon, Copy, Check, ShieldAlert, FileText, DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { fetchAuditLog, isContractDeployed } from '../services/blockchainService';
import { resolveEmailToAddress } from '../services/userService';
import { useVitals } from '../context/VitalsContext';

const weeklyCoverage = [
  { day: 'MON', value: 245000, type: 'coverage' },
  { day: 'TUE', value: 242000, type: 'coverage' },
  { day: 'WED', value: 238000, type: 'coverage' },
  { day: 'THU', value: 236000, type: 'coverage' },
  { day: 'FRI', value: 233500, type: 'coverage' },
  { day: 'SAT', value: 231000, type: 'coverage' },
  { day: 'SUN', value: 229000, type: 'coverage' },
];

export function Reports() {
  const [blockchainLogs, setBlockchainLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isContractDetected, setIsContractDetected] = useState(true);
  const {
    coverageAmount,
    claimsFiled,
    deductibleStatus,
    outOfPocket,
    premiumDue,
    policyNumber,
    insuranceProvider,
    insuranceSignals
  } = useVitals();
  
  // Get patient address from URL if accessing as a doctor
  const queryParams = new URLSearchParams(window.location.search);
  const targetPatient = queryParams.get('patient');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadLogs = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoadingLogs(true);
      setError(null);

      let patientToFetch = targetPatient || undefined;

      // If targetPatient is an email, try to resolve it first
      if (targetPatient && !targetPatient.startsWith('0x')) {
        console.log("Resolving email to address for reports:", targetPatient);
        const resolved = await resolveEmailToAddress(targetPatient);
        if (resolved) {
          patientToFetch = resolved;
        } else {
          console.warn("Could not resolve email to address, using as is");
        }
      }

      const logs = await fetchAuditLog(patientToFetch);
      setBlockchainLogs(logs);
    } catch (err: any) {
      console.error("Failed to fetch blockchain logs:", err);
      setError(err.message || "Failed to connect to blockchain");
    } finally {
      setLoadingLogs(false);
    }
  }, [targetPatient]);

  useEffect(() => {
    const init = async () => {
      const deployed = await isContractDeployed();
      setIsContractDetected(deployed);
      loadLogs();
    };
    init();
    
    const handleRefresh = () => loadLogs(false);
    window.addEventListener('blockchain-update', handleRefresh);
    return () => window.removeEventListener('blockchain-update', handleRefresh);
  }, [loadLogs]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      {targetPatient && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="text-sm font-bold text-red-900">Emergency Access Active: Viewing records for {targetPatient}</span>
          </div>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="text-xs font-bold text-red-600 hover:underline"
          >
            Exit Emergency View
          </button>
        </div>
      )}
      {error && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Connection Issue</h4>
              <p className="text-sm text-amber-700">{error}. Showing local records only.</p>
            </div>
          </div>
          <button 
            onClick={() => loadLogs()}
            className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry Sync
          </button>
        </div>
      )}

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex bg-surface-container-low p-1 rounded-full">
            {['Daily', 'Weekly', 'Monthly'].map((t) => (
              <button key={t} className={cn("px-6 py-2 rounded-full text-sm font-bold transition-all", t === 'Weekly' ? "bg-surface-container-lowest shadow-sm text-primary" : "text-outline hover:text-on-surface")}>
                {t}
              </button>
            ))}
            <button className="px-6 py-2 rounded-full text-sm font-bold text-outline flex items-center gap-2">
              Custom <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isContractDetected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Simulation Mode</span>
            </div>
          )}
          <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            <Download className="w-5 h-5" /> Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{coverageAmount.label}</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-headline font-extrabold text-on-surface">${coverageAmount.value.toLocaleString()}</h2>
                <span className="text-xs font-bold text-outline">{coverageAmount.unit}</span>
                <span className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold",
                  coverageAmount.status === 'ACTIVE' ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-red-100 text-red-700"
                )}>
                  {coverageAmount.status}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="text-[10px] font-bold text-outline">Latest</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-outline">Trend</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCoverage}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#737685' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {weeklyCoverage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'coverage' ? '#003d9b' : '#003d9b66'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stats */}
        <div className="space-y-6">
          <div className="bg-primary p-8 rounded-[2.5rem] text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Insurance Provider</p>
              <h2 className="text-3xl font-headline font-extrabold mb-2">{insuranceProvider.value}</h2>
              <p className="text-xs opacity-80 leading-relaxed mb-6">
                Provider verified on-chain with live policy performance tracking.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-[10px] font-bold hover:bg-white/20 transition-all">
                <ShieldCheck className="w-4 h-4" /> Provider Verified
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">{claimsFiled.label}</p>
              <h3 className="text-3xl font-headline font-extrabold text-on-surface">{claimsFiled.value}</h3>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              claimsFiled.status === 'ACTIVE' ? "bg-secondary/10 text-secondary" : "bg-red-100 text-red-600"
            )}>
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Insurance Summary Card */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">{outOfPocket.label}</p>
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-container-low" />
              <circle 
                cx="80" cy="80" r="70" 
                stroke="currentColor" 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={440} 
                strokeDashoffset={440 * (1 - Math.min(1, (outOfPocket.value as number) / 10000))} 
                className={outOfPocket.status === 'ACTIVE' ? "text-tertiary" : "text-red-500"} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <DollarSign className={cn("w-8 h-8 mb-1", outOfPocket.status === 'ACTIVE' ? "text-tertiary" : "text-red-500")} />
              <span className="text-2xl font-headline font-extrabold text-on-surface">${(outOfPocket.value as number).toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-8 w-full">
            <div className="flex-1">
              <p className="text-[10px] text-outline font-bold">Next Premium</p>
              <p className="text-sm font-bold text-on-surface">{premiumDue.value}</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-outline font-bold">Policy ID</p>
              <p className="text-sm font-bold text-on-surface">{policyNumber.value}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {insuranceSignals.map((signal, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 rounded-3xl border-l-4 shadow-sm flex items-start gap-4",
                signal.type === 'critical' ? "bg-red-50 border-red-500" :
                signal.type === 'warning' ? "bg-amber-50 border-amber-500" :
                "bg-surface-container-lowest border-teal-500"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                signal.type === 'critical' ? "bg-red-100 text-red-500" :
                signal.type === 'warning' ? "bg-amber-100 text-amber-500" :
                "bg-teal-50 text-teal-500"
              )}>
                {signal.type === 'critical' ? <AlertTriangle className="w-6 h-6" /> : 
                 signal.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> : 
                 <BrainCircuit className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-on-surface">{signal.message}</h4>
                  <span className="text-[10px] font-bold text-outline">{signal.timestamp}</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">
                  {signal.type === 'info' 
                    ? "Insurance coverage is stable and no urgent claims actions are required. Blockchain validation adds audit confidence."
                    : "Automated insurance risk detection flagged a coverage or claims issue. This event has been recorded in the immutable ledger."}
                </p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-[10px] font-bold text-outline">Ref: Policy Audit</span>
                  {signal.type !== 'info' && (
                    <button className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all">Notify Provider</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Medical Reports Section */}
      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-headline font-bold text-on-surface">Clinical Reports & Documents</h3>
          </div>
          <span className="text-xs font-bold text-outline uppercase tracking-widest">
            {loadingLogs ? 'Synchronizing...' : `${blockchainLogs.filter(l => !l.ipfsHash.includes('_')).length} Documents Found`}
          </span>
        </div>

        {loadingLogs ? (
          <div className="flex flex-col items-center justify-center py-12 text-outline">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-bold">Fetching Clinical Documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {blockchainLogs.filter(l => !l.ipfsHash.includes('_')).map((report, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-outline">{report.formattedDate}</span>
                </div>
                <h4 className="font-bold text-on-surface mb-1 truncate">{report.recordType}</h4>
                <p className="text-[10px] font-mono text-outline mb-6 truncate">CID: {report.ipfsHash}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => window.open(`https://ipfs.io/ipfs/${report.ipfsHash}`, '_blank')}
                    className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> View Report
                  </button>
                  <button 
                    onClick={() => copyToClipboard(report.ipfsHash, `rep-${idx}`)}
                    className="p-2.5 rounded-xl bg-surface-container-highest text-outline hover:text-primary transition-all"
                  >
                    {copiedId === `rep-${idx}` ? <Check className="w-4 h-4 text-teal-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            ))}
            {blockchainLogs.filter(l => !l.ipfsHash.includes('_')).length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-outline-variant/30 rounded-3xl">
                <p className="text-sm font-bold text-outline">No clinical documents found for this patient.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-surface-container-low/50 p-8 rounded-[2.5rem] border border-outline-variant/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-headline font-bold text-on-surface">Immutable Audit Log</h3>
          </div>
          <button 
            onClick={() => loadLogs()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-outline hover:text-on-surface transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", loadingLogs && "animate-spin")} />
            <span className="text-xs font-bold">Refresh Log</span>
          </button>
        </div>
        <div className="space-y-4">
          {loadingLogs ? (
            <div className="flex flex-col items-center justify-center py-12 text-outline">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-bold">Synchronizing with Blockchain...</p>
            </div>
          ) : blockchainLogs.length > 0 ? (
            blockchainLogs.map((log, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-5 rounded-2xl flex items-center justify-between group hover:shadow-md transition-all">
                <div className="grid grid-cols-3 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase mb-1">Timestamp</p>
                    <p className="text-sm font-bold text-on-surface">{log.formattedDate}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase mb-1">Activity Type</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500" />
                      <p className="text-sm font-bold text-on-surface">{log.recordType}</p>
                      {log.isSimulated && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter">Simulated</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase mb-1">Integrity Hash</p>
                    <p className="text-sm font-mono text-outline truncate max-w-[150px]">{log.transactionHash}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyToClipboard(log.ipfsHash, `ipfs-${idx}`)}
                    title="Copy IPFS CID"
                    className="p-2 rounded-xl hover:bg-surface-container-low text-outline hover:text-primary transition-all relative"
                  >
                    {copiedId === `ipfs-${idx}` ? <Check className="w-5 h-5 text-teal-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${log.transactionHash}`, '_blank')}
                    title="View on Etherscan"
                    className="p-2 rounded-xl hover:bg-surface-container-low text-outline hover:text-primary transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
              <p className="text-sm font-bold text-outline">No immutable records found on-chain.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
