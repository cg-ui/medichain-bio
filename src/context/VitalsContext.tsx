import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface InsuranceData {
  value: string | number;
  history: { value: number; date: string }[];
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CLAIMED';
  label: string;
  unit?: string;
  description?: string;
}

interface InsuranceContextType {
  insuranceProvider: InsuranceData;
  policyNumber: InsuranceData;
  coverageAmount: InsuranceData;
  claimsFiled: InsuranceData;
  deductibleStatus: InsuranceData;
  outOfPocket: InsuranceData;
  premiumDue: InsuranceData;
  insuranceSignals: {
    type: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
  }[];
}

const InsuranceContext = createContext<InsuranceContextType | undefined>(undefined);

export function VitalsProvider({ children }: { children: ReactNode }) {
  const [insuranceProvider, setInsuranceProvider] = useState<InsuranceData>({
    value: 'BlueCross BlueShield',
    history: [],
    status: 'ACTIVE',
    label: 'Insurance Provider',
    description: 'Primary health insurance provider'
  });

  const [policyNumber, setPolicyNumber] = useState<InsuranceData>({
    value: 'BCBS-2024-789456',
    history: [],
    status: 'ACTIVE',
    label: 'Policy Number',
    description: 'Unique insurance policy identifier'
  });

  const [coverageAmount, setCoverageAmount] = useState<InsuranceData>({
    value: 250000,
    history: [
      { value: 250000, date: '2024-01-01' },
      { value: 240000, date: '2024-02-15' },
      { value: 235000, date: '2024-03-20' }
    ],
    status: 'ACTIVE',
    label: 'Coverage Amount',
    unit: '$',
    description: 'Remaining coverage for the year'
  });

  const [claimsFiled, setClaimsFiled] = useState<InsuranceData>({
    value: 12,
    history: [
      { value: 8, date: '2024-01-31' },
      { value: 10, date: '2024-02-28' },
      { value: 12, date: '2024-03-31' }
    ],
    status: 'ACTIVE',
    label: 'Claims Filed',
    unit: 'claims',
    description: 'Total claims filed this year'
  });

  const [deductibleStatus, setDeductibleStatus] = useState<InsuranceData>({
    value: 1200,
    history: [
      { value: 2500, date: '2024-01-01' },
      { value: 1800, date: '2024-02-15' },
      { value: 1200, date: '2024-03-20' }
    ],
    status: 'ACTIVE',
    label: 'Deductible Remaining',
    unit: '$',
    description: 'Amount left to meet deductible'
  });

  const [outOfPocket, setOutOfPocket] = useState<InsuranceData>({
    value: 2850,
    history: [
      { value: 1200, date: '2024-01-31' },
      { value: 2100, date: '2024-02-28' },
      { value: 2850, date: '2024-03-31' }
    ],
    status: 'ACTIVE',
    label: 'Out-of-Pocket',
    unit: '$',
    description: 'Total out-of-pocket expenses this year'
  });

  const [premiumDue, setPremiumDue] = useState<InsuranceData>({
    value: '2024-04-15',
    history: [],
    status: 'PENDING',
    label: 'Next Premium Due',
    description: 'Date when next premium payment is due'
  });

  const [insuranceSignals, setInsuranceSignals] = useState<InsuranceContextType['insuranceSignals']>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate coverage amount changes (claims processing)
      setCoverageAmount(prev => {
        const reduction = Math.floor(Math.random() * 2000); // Random claim amount
        const newValue = Math.max(0, (prev.value as number) - (Math.random() > 0.7 ? reduction : 0));
        const newHistory = [...prev.history.slice(-9), { value: newValue, date: new Date().toISOString().split('T')[0] }];
        return { ...prev, value: newValue, history: newHistory };
      });

      // Simulate claims being filed
      setClaimsFiled(prev => {
        const newValue = (prev.value as number) + (Math.random() > 0.8 ? 1 : 0); // Occasional new claim
        const newHistory = [...prev.history.slice(-9), { value: newValue, date: new Date().toISOString().split('T')[0] }];
        return { ...prev, value: newValue, history: newHistory };
      });

      // Simulate deductible progress
      setDeductibleStatus(prev => {
        const reduction = Math.floor(Math.random() * 200); // Random deductible payment
        const newValue = Math.max(0, (prev.value as number) - (Math.random() > 0.6 ? reduction : 0));
        const newHistory = [...prev.history.slice(-9), { value: newValue, date: new Date().toISOString().split('T')[0] }];
        return { ...prev, value: newValue, history: newHistory };
      });

      // Simulate out-of-pocket expenses
      setOutOfPocket(prev => {
        const addition = Math.floor(Math.random() * 500); // Random expense
        const newValue = (prev.value as number) + (Math.random() > 0.5 ? addition : 0);
        const newHistory = [...prev.history.slice(-9), { value: newValue, date: new Date().toISOString().split('T')[0] }];
        return { ...prev, value: newValue, history: newHistory };
      });
    }, 10000); // Update every 10 seconds for insurance data

    return () => clearInterval(interval);
  }, []);

  // Update Insurance Signals based on insurance data
  useEffect(() => {
    const signals: InsuranceContextType['insuranceSignals'] = [];
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if ((deductibleStatus.value as number) < 500) {
      signals.push({ type: 'warning', message: `Deductible nearly met: $${deductibleStatus.value} remaining`, timestamp: now });
    }

    if ((coverageAmount.value as number) < 50000) {
      signals.push({ type: 'critical', message: `Low coverage remaining: $${coverageAmount.value}`, timestamp: now });
    }

    if ((outOfPocket.value as number) > 5000) {
      signals.push({ type: 'warning', message: `High out-of-pocket expenses: $${outOfPocket.value}`, timestamp: now });
    }

    const premiumDate = new Date(premiumDue.value);
    const daysUntilDue = Math.ceil((premiumDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 7 && daysUntilDue > 0) {
      signals.push({ type: 'warning', message: `Premium due in ${daysUntilDue} days`, timestamp: now });
    } else if (daysUntilDue <= 0) {
      signals.push({ type: 'critical', message: 'Premium payment is overdue', timestamp: now });
    }

    if (signals.length === 0) {
      signals.push({ type: 'info', message: 'Insurance coverage is in good standing.', timestamp: now });
    }

    setInsuranceSignals(signals);
  }, [deductibleStatus.value, coverageAmount.value, outOfPocket.value, premiumDue.value]);

  return (
    <InsuranceContext.Provider value={{
      insuranceProvider,
      policyNumber,
      coverageAmount,
      claimsFiled,
      deductibleStatus,
      outOfPocket,
      premiumDue,
      insuranceSignals
    }}>
      {children}
    </InsuranceContext.Provider>
  );
}

export function useVitals() {
  const context = useContext(InsuranceContext);
  if (context === undefined) {
    throw new Error('useVitals must be used within a VitalsProvider');
  }
  return context;
}
