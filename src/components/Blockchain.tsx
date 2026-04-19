import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Database, Activity, Search, Filter, ExternalLink, CheckCircle2, Clock, RefreshCw, Lock, Globe, FileCheck, Loader2, UserPlus, Unlock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchAuditLog } from '../services/blockchainService';
import { AuditLogEntry } from '../types';

interface BlockchainEntry {
  status: string;
  timestamp: string;
  type: string;
  entity: string;
  hash: string;
  icon: React.ElementType;
  isSimulated?: boolean;
}

export function Blockchain() {
  const [activities, setActivities] = useState<BlockchainEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const logs = await fetchAuditLog();
      
      const mappedEntries = logs.map((log, index) => {
        let icon = Database;
        if (log.ipfsHash === "LOGIN_EVENT") icon = Shield;
        else if (log.ipfsHash === "ACCESS_GRANT" || log.ipfsHash === "EMERGENCY_GRANT") icon = UserPlus;
        else if (log.ipfsHash === "EMERGENCY_TOGGLE") icon = log.recordType.includes('ENABLED') ? Unlock : Lock;

        return {
          status: log.isPendingSync ? 'Pending' : 'Confirmed',
          timestamp: log.formattedDate,
          type: log.recordType,
          entity: log.uploader.slice(0, 10) + '...',
          hash: log.transactionHash.slice(0, 10) + '...',
          icon,
          isSimulated: log.isSimulated
        };
      });

      setActivities(mappedEntries);
    } catch (err) {
      console.error("Failed to fetch blockchain logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    const handleBlockchainUpdate = () => loadActivities(false);
    window.addEventListener('blockchain-update', handleBlockchainUpdate);
    return () => window.removeEventListener('blockchain-update', handleBlockchainUpdate);
  }, [loadActivities]);
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-headline font-extrabold text-on-surface tracking-tight">Blockchain Transparency Panel</h2>
        <div className="flex items-center gap-4">
          <span className="px-4 py-1.5 rounded-full bg-surface-container-low text-xs font-bold text-outline">Network Status: Operational</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase tracking-widest">Immutable</span>
          </div>
          <p className="text-xs text-outline font-bold mb-1">Patient Trust Score</p>
          <h3 className="text-4xl font-headline font-extrabold text-on-surface mb-2">99.9%</h3>
          <p className="text-xs text-outline">Historical data integrity verified</p>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="w-16 h-16 text-secondary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-1 rounded uppercase tracking-widest">Real-time</span>
          </div>
          <p className="text-xs text-outline font-bold mb-1">Network Traceability</p>
          <h3 className="text-4xl font-headline font-extrabold text-on-surface mb-2">1,204</h3>
          <p className="text-xs text-outline">Active nodes validating health records</p>
        </div>

        <div className="bg-primary p-8 rounded-3xl shadow-lg shadow-primary/20 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-xs opacity-70 font-bold mb-1">Last Block Sync</p>
            <h3 className="text-4xl font-headline font-extrabold mb-2">#829,142 <span className="w-2 h-2 inline-block rounded-full bg-teal-400 animate-pulse ml-2" /></h3>
            <p className="text-xs opacity-70">Latency: 1.2s</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-32 h-32" />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10">
          <div>
            <h3 className="text-xl font-headline font-bold text-on-surface">Ledger Transparency</h3>
            <p className="text-sm text-outline">Immutable audit trail of all medical data interactions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search hash..." 
                className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <button className="p-2 rounded-xl bg-surface-container-low text-outline hover:bg-surface-container-high transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-outline border-b border-outline-variant/10">
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Action Type</th>
                <th className="px-8 py-4">Entity Identity</th>
                <th className="px-8 py-4">Transaction Hash</th>
                <th className="px-8 py-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-outline">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm font-bold">Fetching ledger from blockchain...</p>
                    </div>
                  </td>
                </tr>
              ) : activities.length > 0 ? (
                activities.map((entry, idx) => (
                  <tr key={idx} className="group hover:bg-surface-container-low transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", entry.status === 'Confirmed' ? "bg-teal-500" : "bg-outline-variant animate-pulse")} />
                        <span className="text-xs font-bold text-on-surface">{entry.status}</span>
                        {entry.isSimulated && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter ml-1">Simulated</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-on-surface-variant">{entry.timestamp}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <entry.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-on-surface">{entry.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-on-surface-variant">{entry.entity}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-mono text-outline bg-surface-container-low px-2 py-1 rounded">{entry.hash}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {entry.status === 'Confirmed' ? (
                        <button className="text-[10px] font-bold text-primary flex items-center gap-1 ml-auto hover:underline">
                          View on Blockchain <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 justify-end text-[10px] font-bold text-outline">
                          Syncing... <RefreshCw className="w-3 h-3 animate-spin" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-outline text-sm font-bold">
                    No ledger entries found on the blockchain.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 flex items-center justify-center gap-2 border-t border-outline-variant/10">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-low transition-all">
            <Clock className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-primary text-white font-bold text-xs">1</button>
          <button className="w-8 h-8 rounded-lg text-outline font-bold text-xs hover:bg-surface-container-low">2</button>
          <button className="w-8 h-8 rounded-lg text-outline font-bold text-xs hover:bg-surface-container-low">3</button>
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container-low transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-surface-container-high transition-all">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-headline font-bold text-on-surface mb-2">Cryptographic Traceability</h4>
            <p className="text-xs text-outline leading-relaxed">Every record carries a unique digital fingerprint, ensuring any unauthorized modifications are instantly detected by the network.</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-surface-container-high transition-all">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-teal-600 shadow-sm group-hover:scale-110 transition-transform">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg font-headline font-bold text-on-surface mb-2">Compliance Standards</h4>
            <p className="text-xs text-outline leading-relaxed">Fully HIPAA & GDPR compliant data orchestration layered on sovereign blockchain architecture for maximum patient privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
