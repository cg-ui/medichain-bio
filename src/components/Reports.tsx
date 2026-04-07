import React, { useState, useEffect } from 'react';
import { Download, Calendar, Activity, Droplets, Thermometer, AlertCircle, Lightbulb, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { fetchAuditLog } from '../services/blockchainService';

const weeklyHeartRate = [
  { day: 'MON', value: 65, type: 'resting' },
  { day: 'TUE', value: 58, type: 'resting' },
  { day: 'WED', value: 72, type: 'active' },
  { day: 'THU', value: 85, type: 'active' },
  { day: 'FRI', value: 60, type: 'resting' },
  { day: 'SAT', value: 68, type: 'resting' },
  { day: 'SUN', value: 75, type: 'active' },
];

export function Reports() {
  const [blockchainLogs, setBlockchainLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoadingLogs(true);
        // In a real app, we'd pass the current patient's address
        const logs = await fetchAuditLog();
        setBlockchainLogs(logs);
      } catch (err: any) {
        console.error("Failed to fetch blockchain logs:", err);
        setError(err.message || "Failed to connect to blockchain");
        // Fallback to mock data for demo if blockchain fails
        setBlockchainLogs([
          { formattedDate: '12 Oct 2023 14:32', recordType: 'Lab Result Synced (Mock)', transactionHash: '0x7a...4e21' },
          { formattedDate: '12 Oct 2023 11:05', recordType: 'Access Granted: Dr. Sarah W. (Mock)', transactionHash: '0xb1...88c4' },
        ]);
      } finally {
        setLoadingLogs(false);
      }
    };

    loadLogs();
  }, []);

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
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
        <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          <Download className="w-5 h-5" /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Heart Rate</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-4xl font-headline font-extrabold text-on-surface">72</h2>
                <span className="text-xs font-bold text-outline">bpm</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">Stable</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span className="text-[10px] font-bold text-outline">Resting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-[10px] font-bold text-outline">Active</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHeartRate}>
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
                  {weeklyHeartRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'active' ? '#003d9b' : '#003d9b66'} />
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
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-2">Health Risk Score</p>
              <h2 className="text-6xl font-headline font-extrabold mb-4">98<span className="text-2xl opacity-50">/100</span></h2>
              <p className="text-xs opacity-80 leading-relaxed mb-6">
                Your biometrics are within optimal ranges. Blockchain verification suggests no tampering in latest data blocks.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-[10px] font-bold hover:bg-white/20 transition-all">
                <ShieldCheck className="w-4 h-4" /> Immutable Verification
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">SpO₂ Level</p>
              <h3 className="text-3xl font-headline font-extrabold text-on-surface">99%</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Temperature Card */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Temperature</p>
          <div className="relative w-40 h-40 flex items-center justify-center mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-container-low" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 * (1 - 0.75)} className="text-tertiary" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Thermometer className="w-8 h-8 text-tertiary mb-1" />
              <span className="text-2xl font-headline font-extrabold text-on-surface">98.6°F</span>
            </div>
          </div>
          <div className="flex gap-8 w-full">
            <div className="flex-1">
              <p className="text-[10px] text-outline font-bold">Highest (Today)</p>
              <p className="text-sm font-bold text-on-surface">99.1°F</p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-outline font-bold">Lowest (Today)</p>
              <p className="text-sm font-bold text-on-surface">97.8°F</p>
            </div>
          </div>
        </div>

        {/* AI Signals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-headline font-bold text-on-surface">Diagnostic AI Signals</h3>
            <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">View All History</button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-surface-container-lowest p-6 rounded-3xl border-l-4 border-red-500 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-on-surface">Abnormal Tachycardia Detected</h4>
                  <span className="text-[10px] font-bold text-outline">2 HOURS AGO</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">Heart rate sustained 115bpm for 12 minutes during a restful state. This deviates from your historical baseline by +42%.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-[10px] font-bold text-outline">Ref: Block #821,992</span>
                  <button className="px-3 py-1 rounded-full bg-primary/10 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all">Alert Provider</button>
                  <button className="px-3 py-1 rounded-full bg-surface-container-low text-[10px] font-bold text-outline hover:bg-surface-container-high transition-all">Dismiss</button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-3xl border-l-4 border-teal-500 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-500">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-on-surface">Sleep Pattern Optimization</h4>
                  <span className="text-[10px] font-bold text-outline">YESTERDAY</span>
                </div>
                <p className="text-xs text-on-surface-variant mb-4">Consistency in REM cycles has improved by 14% this week. Maintain current bedtime for continued cognitive recovery scores.</p>
                <button className="px-3 py-1 rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-600 hover:bg-teal-500/20 transition-all">View Recommendations</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log */}
      <div className="bg-surface-container-low/50 p-8 rounded-[2.5rem] border border-outline-variant/10">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-headline font-bold text-on-surface">Immutable Audit Log</h3>
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
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-outline uppercase mb-1">Integrity Hash</p>
                    <p className="text-sm font-mono text-outline truncate max-w-[150px]">{log.transactionHash}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${log.transactionHash}`, '_blank')}
                  className="p-2 rounded-xl hover:bg-surface-container-low text-outline group-hover:text-primary transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
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
