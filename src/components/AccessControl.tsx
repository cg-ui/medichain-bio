import React, { useState } from 'react';
import { Shield, Stethoscope, UserCog, User, Activity, Beaker, FileText, Clock, CheckCircle2, AlertCircle, History, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

const auditLogs = [
  {
    id: 1,
    time: 'TODAY, 10:42 AM',
    text: 'Vitals read by Dr. Jenkins',
    subtext: 'Verified on MediChain Ledger',
    icon: CheckCircle2,
    color: 'text-primary'
  },
  {
    id: 2,
    time: 'YESTERDAY, 04:15 PM',
    text: 'Lab Results accessed by System Admin',
    subtext: 'Security Audit #8821',
    icon: History,
    color: 'text-outline'
  },
  {
    id: 3,
    time: 'OCT 22, 09:12 AM',
    text: 'Access Grant Revoked',
    subtext: 'Entity: LabCorp Global',
    icon: AlertCircle,
    color: 'text-red-500'
  }
];

export function AccessControl() {
  const [selectedRole, setSelectedRole] = useState('doctor');
  const [duration, setDuration] = useState('7 Days');

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
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'doctor', icon: Stethoscope, label: 'Doctor' },
                  { id: 'admin', icon: UserCog, label: 'Admin' },
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

            {/* Data Modules */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">Select Data Modules</p>
              <div className="space-y-3">
                {[
                  { icon: Activity, label: 'Vitals & Monitoring', desc: 'Real-time heart rate, BP, and SPO2 logs', default: true },
                  { icon: Beaker, label: 'Lab Results', desc: 'Bloodwork, DNA sequencing, and pathology', default: true },
                  { icon: FileText, label: 'Clinical History', desc: 'Past diagnosis and surgical records', default: false }
                ].map((module, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-surface-container-low group hover:bg-surface-container-high transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                        <module.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{module.label}</p>
                        <p className="text-xs text-outline">{module.desc}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-colors cursor-pointer",
                      module.default ? "bg-primary" : "bg-outline-variant/30"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        module.default ? "right-1" : "left-1"
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
                {['24h', '7 Days', '30 Days', 'Indefinite'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={cn(
                      "flex-1 py-3 rounded-full font-bold text-sm transition-all",
                      duration === d 
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border border-outline-variant/20 text-outline hover:bg-surface-container-low"
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
            <div className="p-5 rounded-3xl border-2 border-primary bg-primary/5 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary text-white">ACTIVE</span>
                <span className="text-[10px] font-mono text-outline">0x71C...3a41</span>
              </div>
              <p className="font-bold text-on-surface">Dr. Sarah Jenkins</p>
              <p className="text-xs text-outline mb-4">General Clinic Center</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Expires in 4 days</span>
                <button className="text-[10px] font-bold text-red-500 hover:underline">Revoke</button>
              </div>
            </div>

            <div className="p-5 rounded-3xl border border-outline-variant/20 bg-surface-container-low">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-outline-variant text-white">PENDING</span>
                <span className="text-[10px] font-mono text-outline">0x42A...9b22</span>
              </div>
              <p className="font-bold text-on-surface">Mayo Lab Services</p>
              <p className="text-xs text-outline mb-4">Genome Analysis</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Awaiting Confirmation</span>
                <button className="text-[10px] font-bold text-primary hover:underline">Approve</button>
              </div>
            </div>
          </div>
        </div>

        {/* Access Audit */}
        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-8">
            <History className="w-5 h-5 text-primary" />
            <h4 className="font-headline font-bold text-on-surface">Access Audit</h4>
          </div>
          <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
            {auditLogs.map((log) => (
              <div key={log.id} className="relative">
                <div className={cn("absolute -left-[23px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 bg-white flex items-center justify-center", log.color)}>
                  <log.icon className="w-3 h-3" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline mb-1">{log.time}</p>
                  <p className="text-sm font-bold text-on-surface">{log.text}</p>
                  <p className="text-[10px] text-outline">{log.subtext}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
