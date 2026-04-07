import React, { useState, useEffect } from 'react';
import { Shield, User, Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Apple, Moon, Sun, Wallet, AlertCircle, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useMetaMask } from '../hooks/useMetaMask';

interface AuthPageProps {
  onLogin: (user: any) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function AuthPage({ onLogin, isDarkMode, onToggleDarkMode }: AuthPageProps) {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const { walletAddress, isConnecting, error: metamaskError, connect } = useMetaMask();

  useEffect(() => {
    if (walletAddress) {
      onLogin({
        email: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        walletAddress,
        role,
        name: role === 'doctor' ? 'Dr. Web3' : 'Sovereign Patient'
      });
    }
  }, [walletAddress, onLogin, role]);

  const handleConnect = async () => {
    await connect();
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row p-8 gap-8">
      {/* Left Side: Branding & Role Selection */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg">
            <Shield className="w-7 h-7 fill-current" />
          </div>
          <h1 className="font-headline font-extrabold text-primary text-3xl tracking-tighter">MediChain-Bio</h1>
        </div>

        <h2 className="text-5xl font-headline font-extrabold text-on-surface tracking-tighter mb-4">Choose Your Path</h2>
        <p className="text-outline text-lg font-medium mb-12 max-w-md">
          Access your sovereign health data or clinical workstation through our encrypted gateway.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setRole('patient')}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 text-left transition-all group",
              role === 'patient' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">I am a Patient</h3>
            <p className="text-xs text-outline mb-6">Manage your medical records, grant clinical access, and track wellness.</p>
            <span className="text-sm font-bold text-primary flex items-center gap-2">Select Role <ArrowRight className="w-4 h-4" /></span>
          </button>

          <button 
            onClick={() => setRole('doctor')}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 text-left transition-all group",
              role === 'doctor' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">I am a Doctor</h3>
            <p className="text-xs text-outline mb-6">Access authorized patient data, upload reports, and verify diagnostics.</p>
            <span className="text-sm font-bold text-primary flex items-center gap-2">Select Role <ArrowRight className="w-4 h-4" /></span>
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-outline uppercase tracking-widest">
          <div className="flex -space-x-2">
            {[1, 2].map(i => (
              <img key={i} src={`https://picsum.photos/seed/${i+100}/100/100`} className="w-8 h-8 rounded-full border-2 border-white" alt="Doctor" />
            ))}
          </div>
          Trusted by 2,000+ Verified Practitioners
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-surface-container-lowest p-10 rounded-[3rem] shadow-2xl border border-outline-variant/10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-on-surface">Web3 Authentication</h3>
            <p className="text-sm text-outline mt-2">Connect your MetaMask wallet to access the secure healthcare network.</p>
          </div>

          <div className="space-y-6">
            {metamaskError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{metamaskError}</p>
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-5 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : walletAddress ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {formatAddress(walletAddress)}
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Secure Sign In via MetaMask
                </>
              )}
            </motion.button>

            {!window.ethereum && (
              <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 text-center">
                <p className="text-xs font-medium text-outline mb-4">MetaMask is not detected in your browser.</p>
                <a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest hover:underline"
                >
                  Install MetaMask <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5">
              <Shield className="w-5 h-5 text-teal-500" />
              <p className="text-[10px] font-medium text-outline leading-tight">
                Your private keys never leave your device. All clinical data is encrypted using your wallet's unique signature.
              </p>
            </div>
          </div>

          <p className="mt-8 text-[10px] text-center text-outline leading-relaxed">
            By connecting, you authorize MediChain to verify your identity through the <button className="text-primary font-bold hover:underline">Ethereum Blockchain</button> and adhere to our <button className="text-primary font-bold hover:underline">Sovereignty Protocols</button>.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-8 left-8 right-8 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-outline">
        <div className="flex gap-6">
          <button className="hover:text-on-surface">Emergency Protocol</button>
          <button className="hover:text-on-surface">Institutional Nodes</button>
          <button className="hover:text-on-surface">Blockchain Status</button>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleDarkMode}
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-outline hover:text-on-surface"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
            Secure Network: Active
          </div>
        </div>
      </div>
    </div>
  );
}
