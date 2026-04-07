import React from 'react';
import { Shield, Activity, Lock, Clock, UserPlus, MoreVertical, BarChart2, ChevronLeft, ChevronRight, Zap, History, FileCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

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
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
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
