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
import { DoctorProfile } from './components/DoctorProfile';
import { AccessControl } from './components/AccessControl';
import { Emergency } from './components/Emergency';
import { Reports } from './components/Reports';
import { Blockchain } from './components/Blockchain';
import { AuthPage } from './components/AuthPage';
import { UploadModal } from './components/UploadModal';
import { MedicalUpdateModal } from './components/MedicalUpdateModal';
import { VitalsProvider, useVitals } from './context/VitalsContext';
import { AuthProvider } from './context/AuthContext';
import { UserProfile } from './types';
import { Plus, LogOut, Stethoscope, Syringe, ClipboardList, Upload as UploadIcon, BrainCircuit, AlertTriangle, Info as InfoIcon, Shield, DollarSign, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import { Toaster, toast } from 'sonner';
import { useMetaMask } from './hooks/useMetaMask';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);

  return (
    <AuthProvider initialUser={user}>
      <VitalsProvider>
        <Toaster position="top-right" richColors />
        <AppContent user={user} setUser={setUser} />
      </VitalsProvider>
    </AuthProvider>
  );
}

function AppContent({ user, setUser }: { user: UserProfile | null, setUser: (u: UserProfile | null) => void }) {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'dashboard';
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isFABMenuOpen, setIsFABMenuOpen] = useState(false);
  const {
    insuranceProvider,
    policyNumber,
    coverageAmount,
    claimsFiled,
    deductibleStatus,
    outOfPocket,
    premiumDue,
    insuranceSignals
  } = useVitals();
  const { walletAddress, connect } = useMetaMask();

  useEffect(() => {
    if (walletAddress && user && user.walletAddress && walletAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
      toast.warning("Wallet Mismatch", {
        description: "The connected MetaMask account does not match your profile's linked wallet.",
        action: {
          label: "Switch Account",
          onClick: () => connect(true)
        }
      });
    }
  }, [walletAddress, user]);

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
          const userData = {
            ...(data.user || {}),
            isDemo: data.isDemo ?? false
          };
          setUser(userData);
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
    if (activeTab === 'doctor-profile' && user?.role === 'patient') {
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
              <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tight mb-1">Insurance Overview</h2>
              <p className="text-outline font-medium">Real-time insurance coverage and claims tracking.</p>
            </section>

            {/* Insurance Metrics Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard 
                icon={Shield}
                label={coverageAmount.label}
                value={`$${coverageAmount.value.toLocaleString()}`}
                unit={coverageAmount.unit || ''}
                status={coverageAmount.status}
                colorClass="text-primary"
                data={coverageAmount.history}
                description={coverageAmount.description}
              />
              <MetricCard 
                icon={FileText}
                label={claimsFiled.label}
                value={claimsFiled.value.toString()}
                unit={claimsFiled.unit || ''}
                status={claimsFiled.status}
                colorClass="text-secondary"
                data={claimsFiled.history}
                description={claimsFiled.description}
              />
              <MetricCard 
                icon={DollarSign}
                label={deductibleStatus.label}
                value={`$${deductibleStatus.value.toLocaleString()}`}
                unit={deductibleStatus.unit || ''}
                status={deductibleStatus.status}
                colorClass="text-tertiary"
                data={deductibleStatus.history}
                description={deductibleStatus.description}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard 
                icon={Shield}
                label={outOfPocket.label}
                value={`$${outOfPocket.value.toLocaleString()}`}
                unit={outOfPocket.unit || ''}
                status={outOfPocket.status}
                colorClass="text-slate-600"
                data={outOfPocket.history}
                description={outOfPocket.description}
              />
              <MetricCard 
                icon={DollarSign}
                label={premiumDue.label}
                value={premiumDue.value.toString()}
                unit=""
                status={premiumDue.status}
                colorClass="text-emerald-600"
                data={[]}
                description={premiumDue.description}
              />
              <MetricCard 
                icon={FileText}
                label={policyNumber.label}
                value={policyNumber.value.toString()}
                unit=""
                status={policyNumber.status}
                colorClass="text-blue-600"
                data={[]}
                description={policyNumber.description}
              />
            </div>

            {/* Insurance Alerts Section */}
            <section className="mb-8">
              <div className="bg-surface-container-lowest p-6 rounded-[2rem] border border-primary/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Shield className="w-24 h-24 text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">Insurance Alerts</h3>
                </div>
                <div className="space-y-3 relative z-10">
                  {insuranceSignals.map((signal, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border",
                        signal.type === 'critical' ? "bg-red-50 border-red-200 text-red-700" :
                        signal.type === 'warning' ? "bg-amber-50 border-amber-200 text-amber-700" :
                        "bg-blue-50 border-blue-200 text-blue-700"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {signal.type === 'critical' ? <AlertTriangle className="w-5 h-5" /> : 
                         signal.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> : 
                         <InfoIcon className="w-5 h-5" />}
                        <span className="text-sm font-bold">{signal.message}</span>
                      </div>
                      <span className="text-[10px] font-mono opacity-60">{signal.timestamp}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

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
      case 'doctor-profile':
        return <DoctorProfile />;
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
