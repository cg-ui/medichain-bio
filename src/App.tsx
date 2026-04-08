/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MetricCard } from './components/MetricCard';
import { ActivityFeed } from './components/ActivityFeed';
import { QuickActions } from './components/QuickActions';
import { TrustScoreCard } from './components/TrustScoreCard';
import { ProviderPanel } from './components/ProviderPanel';
import { PatientProfile } from './components/PatientProfile';
import { AccessControl } from './components/AccessControl';
import { Emergency } from './components/Emergency';
import { Reports } from './components/Reports';
import { Blockchain } from './components/Blockchain';
import { AuthPage } from './components/AuthPage';
import { UploadModal } from './components/UploadModal';
import { MedicalUpdateModal } from './components/MedicalUpdateModal';
import { Activity, Droplets, Thermometer, Plus, LogOut, Stethoscope, Syringe, ClipboardList, Upload as UploadIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { cn } from '@/src/lib/utils';

const heartRateData = [
  { value: 60 }, { value: 55 }, { value: 65 }, { value: 70 }, 
  { value: 62 }, { value: 58 }, { value: 64 }, { value: 60 }
];

const spo2Data = [
  { value: 90 }, { value: 92 }, { value: 95 }, { value: 94 }, 
  { value: 93 }, { value: 95 }, { value: 92 }, { value: 94 }
];

const tempData = [
  { value: 40 }, { value: 42 }, { value: 41 }, { value: 43 }, 
  { value: 42 }, { value: 45 }, { value: 42 }, { value: 41 }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.isDemo) setIsDemo(true);
        }
      } catch (err) {
        console.error('Auth check failed');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    // For Web3, we just clear the local state
    setUser(null);
    // If there was a session, we can still try to clear it
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore errors if backend auth is not used
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage 
        onLogin={setUser} 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
      />
    );
  }

  const renderContent = () => {
    // Role-based access control
    if (activeTab === 'patient-profile' && user?.role === 'doctor') {
      setActiveTab('dashboard');
      return null;
    }
    if (activeTab === 'patients' && user?.role === 'patient') {
      setActiveTab('dashboard');
      return null;
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-8 max-w-[1600px] mx-auto w-full">
            {/* Hero Header */}
            <section className="mb-10">
              <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">Clinical Overview</h2>
              <p className="text-outline font-medium">Real-time biometrics and blockchain-secured synchronization.</p>
            </section>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard 
                icon={Activity}
                label="Heart Rate"
                value="72"
                unit="bpm"
                status="NORMAL"
                colorClass="text-primary"
                data={heartRateData}
              />
              <MetricCard 
                icon={Droplets}
                label="SpO₂ Level"
                value="98"
                unit="%"
                status="NORMAL"
                colorClass="text-secondary"
                data={spo2Data}
              />
              <MetricCard 
                icon={Thermometer}
                label="Body Temp"
                value="98.6"
                unit="°F"
                status="STABLE"
                colorClass="text-tertiary"
                data={tempData}
              />
            </div>

            {/* Lower Section: Logs & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ActivityFeed />
              
              <div className="space-y-6">
                <QuickActions 
                  onUploadClick={() => setIsUploadModalOpen(true)}
                  onGrantAccessClick={() => setActiveTab('access-control')}
                  onEmergencyClick={() => setActiveTab('emergency')}
                />
                <TrustScoreCard />
              </div>
            </div>
          </div>
        );
      case 'patients':
        return <ProviderPanel />;
      case 'patient-profile':
        return <PatientProfile />;
      case 'access-control':
        return <AccessControl />;
      case 'emergency':
        return <Emergency />;
      case 'reports':
        return <Reports />;
      case 'blockchain':
        return <Blockchain />;
      default:
        return (
          <div className="p-8 flex items-center justify-center h-full">
            <p className="text-outline font-medium">Feature coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout} 
        onUploadClick={() => setIsUploadModalOpen(true)}
        user={user}
      />
      
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        {isDemo && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-8 py-2 flex items-center justify-between">
            <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">
              Demo Mode: MongoDB not connected. Using in-memory storage.
            </p>
            <p className="text-[10px] font-medium text-amber-600 dark:text-amber-500">
              Configure MONGODB_URI in Settings for persistence.
            </p>
          </div>
        )}
        <TopBar 
          user={user} 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
          onLogout={handleLogout}
        />
        
        {renderContent()}

        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          user={user}
        />

        <MedicalUpdateModal
          isOpen={isMedicalModalOpen}
          onClose={() => setIsMedicalModalOpen(false)}
          user={user}
          onUpdate={(newEntry) => {
            window.dispatchEvent(new CustomEvent('medical-history-update', { detail: newEntry }));
          }}
        />

        {/* Contextual FAB */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
          <AnimatePresence>
            {isFABMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                className="flex flex-col gap-3 mb-2"
              >
                {[
                  { icon: UploadIcon, label: 'Upload Report', onClick: () => { setIsUploadModalOpen(true); setIsFABMenuOpen(false); } },
                  { icon: Stethoscope, label: 'Add Diagnosis', onClick: () => { setIsMedicalModalOpen(true); setIsFABMenuOpen(false); } },
                  { icon: Syringe, label: 'Add Vaccination', onClick: () => { setIsMedicalModalOpen(true); setIsFABMenuOpen(false); } },
                  { icon: ClipboardList, label: 'Add Checkup', onClick: () => { setIsMedicalModalOpen(true); setIsFABMenuOpen(false); } },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.onClick}
                    className="flex items-center gap-3 px-4 py-2 bg-surface-container-highest text-on-surface rounded-xl shadow-lg border border-outline-variant/20 hover:bg-primary hover:text-white transition-all group"
                  >
                    <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>
                    <item.icon className="w-5 h-5" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFABMenuOpen(!isFABMenuOpen)}
            className="w-16 h-16 rounded-full bg-secondary text-white shadow-xl shadow-secondary/30 flex items-center justify-center"
          >
            <Plus className={cn("w-8 h-8 transition-transform duration-300", isFABMenuOpen && "rotate-45")} />
          </motion.button>
        </div>
      </main>
    </div>
  );
}
