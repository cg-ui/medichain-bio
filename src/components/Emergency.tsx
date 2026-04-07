import React from 'react';
import { ShieldAlert, Droplets, AlertTriangle, Activity, Smartphone, Link, Download, Phone, ChevronRight, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export function Emergency() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Emergency Banner */}
      <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <span className="font-bold text-red-900">Emergency Access Active - Blockchain Recorded</span>
        </div>
        <span className="text-[10px] font-mono text-red-600 bg-red-100 px-2 py-1 rounded">TX: 0X4F . . . 92E</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Secure Unlock */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-48 h-48 rounded-full border-8 border-red-50 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-36 h-36 rounded-full bg-red-600 flex flex-col items-center justify-center text-white shadow-2xl shadow-red-600/40 cursor-pointer"
              >
                <Lock className="w-10 h-10 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest">Emergency Access</span>
              </motion.div>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-red-600/20 animate-ping" />
          </div>
          <h3 className="text-2xl font-headline font-extrabold text-on-surface mb-2">Secure Unlock</h3>
          <p className="text-sm text-outline max-w-[240px]">One-tap cryptographic consent override for first responders. Transaction signed via biometric vault.</p>
        </div>

        {/* Right: Vitals & Info */}
        <div className="lg:col-span-2 space-y-8">
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
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Access Ledger */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-headline font-bold text-on-surface">Immutable Access Ledger</h4>
            <button className="text-primary text-[10px] font-bold flex items-center gap-1 hover:underline">
              View Explorer <Link className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">Emergency Override Triggered</p>
                <p className="text-xs text-outline">Location: NYC Metro ER Dispatch</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface">2 mins ago</p>
                <p className="text-[10px] font-mono text-outline uppercase">Block #829,102</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-outline shadow-sm">
                <Link className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">Regular Access: Dr. Sarah Chen</p>
                <p className="text-xs text-outline">Mount Sinai Cardiology</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface">Yesterday</p>
                <p className="text-[10px] font-mono text-outline uppercase">Block #828,450</p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Profile Ready */}
        <div className="bg-surface-container-low p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <Download className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-headline font-bold text-on-surface mb-2">Clinical Profile Ready</h4>
          <p className="text-xs text-outline mb-8 leading-relaxed">Patient identification, medical history, and current medications are decrypted and available for viewing.</p>
          <button className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
            Download Full Briefing
          </button>
        </div>
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
