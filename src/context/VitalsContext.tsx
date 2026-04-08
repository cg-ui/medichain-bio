import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VitalData {
  value: number;
  history: { value: number }[];
  status: 'NORMAL' | 'ABNORMAL' | 'STABLE' | 'CRITICAL';
  label: string;
  unit: string;
}

interface VitalsContextType {
  heartRate: VitalData;
  spo2: VitalData;
  temp: VitalData;
  aiSignals: {
    type: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }[];
}

const VitalsContext = createContext<VitalsContextType | undefined>(undefined);

export function VitalsProvider({ children }: { children: ReactNode }) {
  const [heartRate, setHeartRate] = useState<VitalData>({
    value: 72,
    history: Array(10).fill(0).map(() => ({ value: 70 + Math.random() * 5 })),
    status: 'NORMAL',
    label: 'Heart Rate',
    unit: 'bpm'
  });

  const [spo2, setSpo2] = useState<VitalData>({
    value: 98,
    history: Array(10).fill(0).map(() => ({ value: 97 + Math.random() * 2 })),
    status: 'NORMAL',
    label: 'SpO₂ Level',
    unit: '%'
  });

  const [temp, setTemp] = useState<VitalData>({
    value: 98.6,
    history: Array(10).fill(0).map(() => ({ value: 98.4 + Math.random() * 0.4 })),
    status: 'STABLE',
    label: 'Body Temp',
    unit: '°F'
  });

  const [aiSignals, setAiSignals] = useState<VitalsContextType['aiSignals']>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate Heart Rate
      setHeartRate(prev => {
        const newValue = Math.floor(65 + Math.random() * 15 + (Math.random() > 0.9 ? 30 : 0)); // Occasional spike
        const newHistory = [...prev.history.slice(1), { value: newValue }];
        let status: VitalData['status'] = 'NORMAL';
        if (newValue > 100) status = 'ABNORMAL';
        if (newValue < 60) status = 'ABNORMAL';
        return { ...prev, value: newValue, history: newHistory, status };
      });

      // Simulate SpO2
      setSpo2(prev => {
        const newValue = Math.floor(96 + Math.random() * 4 - (Math.random() > 0.95 ? 5 : 0)); // Occasional dip
        const newHistory = [...prev.history.slice(1), { value: newValue }];
        let status: VitalData['status'] = 'NORMAL';
        if (newValue < 95) status = 'CRITICAL';
        return { ...prev, value: newValue, history: newHistory, status };
      });

      // Simulate Temp
      setTemp(prev => {
        const newValue = parseFloat((98.2 + Math.random() * 0.8 + (Math.random() > 0.98 ? 2.5 : 0)).toFixed(1)); // Occasional fever
        const newHistory = [...prev.history.slice(1), { value: newValue }];
        let status: VitalData['status'] = 'STABLE';
        if (newValue > 100.4) status = 'ABNORMAL';
        return { ...prev, value: newValue, history: newHistory, status };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update AI Signals based on vitals
  useEffect(() => {
    const signals: VitalsContextType['aiSignals'] = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (heartRate.value > 100) {
      signals.push({ type: 'warning', message: `Abnormal Tachycardia detected: ${heartRate.value} bpm`, timestamp: now });
    } else if (heartRate.value < 60) {
      signals.push({ type: 'warning', message: `Bradycardia detected: ${heartRate.value} bpm`, timestamp: now });
    }

    if (spo2.value < 95) {
      signals.push({ type: 'critical', message: `Hypoxia alert: SpO₂ dropped to ${spo2.value}%`, timestamp: now });
    }

    if (temp.value > 100.4) {
      signals.push({ type: 'warning', message: `Pyrexia (Fever) detected: ${temp.value}°F`, timestamp: now });
    }

    if (signals.length === 0) {
      signals.push({ type: 'info', message: 'All vital signs within nominal clinical ranges.', timestamp: now });
    }

    setAiSignals(signals);
  }, [heartRate.value, spo2.value, temp.value]);

  return (
    <VitalsContext.Provider value={{ heartRate, spo2, temp, aiSignals }}>
      {children}
    </VitalsContext.Provider>
  );
}

export function useVitals() {
  const context = useContext(VitalsContext);
  if (context === undefined) {
    throw new Error('useVitals must be used within a VitalsProvider');
  }
  return context;
}
