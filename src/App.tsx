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
import { Activity, Droplets, Thermometer, Plus } from 'lucide-react';
import { motion } from 'motion/react';

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

  const renderContent = () => {
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
                <QuickActions />
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
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="ml-64 flex-1 min-h-screen flex flex-col">
        <TopBar />
        
        {renderContent()}

        {/* Contextual FAB */}
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-secondary text-white shadow-xl shadow-secondary/30 flex items-center justify-center z-50"
        >
          <Plus className="w-8 h-8" />
        </motion.button>
      </main>
    </div>
  );
}
