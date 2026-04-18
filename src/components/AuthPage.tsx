import React, { useState, useEffect } from 'react';
import { Shield, User, Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Apple, Moon, Sun, Wallet, AlertCircle, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useMetaMask } from '../hooks/useMetaMask';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (user: any) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

import { logLoginOnChain } from '../services/blockchainService';
import { resolveEmailToAddress } from '../services/userService';
import { ethers } from 'ethers';

export function AuthPage({ onLogin, isDarkMode, onToggleDarkMode }: AuthPageProps) {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [step, setStep] = useState<'login' | 'connect'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  const { walletAddress, isConnecting, error: metamaskError, connect } = useMetaMask();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          role,
          name: name || email.split('@')[0],
          walletAddress: walletAddress || ""
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed');

      if (isSignUp) {
        // After signup, automatically login
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error || 'Login failed after signup');
        setStep('connect');
      } else {
        setStep('connect');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFinalizeLogin = async (address?: string) => {
    setIsFinalizing(true);
    setError(null);
    try {
      // If we have a wallet address, we MUST get a signature and log on-chain
      if (address && window.ethereum) {
        toast.info("Please confirm the verification signature in MetaMask");
        
        // 1. Request signature for identity verification
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const message = `MediChain-Bio Identity Verification\n\nTimestamp: ${new Date().toISOString()}\nWallet: ${address}\n\nBy signing this message, you are verifying your identity on the MediChain-Bio secure network.`;
        await signer.signMessage(message);
        
        // 2. Log the login event on the blockchain (requires gas/confirmation)
        toast.info("Recording login event on Sepolia blockchain...");
        const txHash = await logLoginOnChain();
        toast.success(`Login verified on-chain! Tx: ${txHash.slice(0, 10)}...`);
        
        // 3. Update the user profile on the server
        await fetch('/api/auth/update-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: address }),
        });
      }

      // Fetch the latest user data
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      const userToLogin = {
        ...(data.user || {}),
        role: data.user?.role || role,
        email: data.user?.email || email,
        name: data.user?.name || name || (data.user?.email || email).split('@')[0],
        walletAddress: address || data.user?.walletAddress || null,
        isDemo: data.isDemo ?? true
      };

      console.log("Finalizing login with user:", userToLogin);
      onLogin(userToLogin);
    } catch (err: any) {
      console.error("Finalization error:", err);
      setError(err.message || "Failed to finalize secure login");
      // If it's a user rejection, don't force them out, but show error
      if (err.code === 4001) {
        toast.error("Verification rejected. Secure features may be limited.");
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  useEffect(() => {
    if (walletAddress && step === 'connect') {
      handleFinalizeLogin(walletAddress);
    }
  }, [walletAddress, step]);

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

        <h2 className="text-5xl font-headline font-extrabold text-on-surface tracking-tighter mb-4">
          {step === 'login' ? 'Welcome Back' : 'Secure Your Identity'}
        </h2>
        <p className="text-outline text-lg font-medium mb-12 max-w-md">
          {step === 'login' 
            ? 'Access your sovereign health data or clinical workstation through our encrypted gateway.'
            : 'Link your Web3 wallet for advanced encryption and blockchain-verified medical records.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setRole('patient')}
            disabled={step === 'connect'}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 text-left transition-all group",
              role === 'patient' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30",
              step === 'connect' && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">I am a Patient</h3>
            <p className="text-xs text-outline mb-6">Manage your medical records, grant clinical access, and track wellness.</p>
            {step === 'login' && <span className="text-sm font-bold text-primary flex items-center gap-2">Select Role <ArrowRight className="w-4 h-4" /></span>}
          </button>

          <button 
            onClick={() => setRole('doctor')}
            disabled={step === 'connect'}
            className={cn(
              "p-8 rounded-[2.5rem] border-2 text-left transition-all group",
              role === 'doctor' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/30",
              step === 'connect' && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">I am a Doctor</h3>
            <p className="text-xs text-outline mb-6">Access authorized patient data, upload reports, and verify diagnostics.</p>
            {step === 'login' && <span className="text-sm font-bold text-primary flex items-center gap-2">Select Role <ArrowRight className="w-4 h-4" /></span>}
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
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-headline font-bold text-on-surface">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </h3>
                  <p className="text-sm text-outline mt-2">
                    {isSignUp ? 'Join the MediChain network today.' : 'Enter your credentials to continue.'}
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  {isSignUp && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                        <input 
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-primary hover:underline">Forgot Password?</button>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 mt-4"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isSignUp ? 'Creating Account...' : 'Verifying...'}
                      </>
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-8 pt-8 border-t border-outline-variant/10">
                  <p className="text-xs text-center text-outline">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
                    <button 
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary font-bold hover:underline ml-1"
                    >
                      {isSignUp ? 'Sign In' : 'Create Account'}
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="connect-wallet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                    <Wallet className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-on-surface">Connect Wallet</h3>
                  <p className="text-sm text-outline mt-2">Optional: Link your MetaMask for blockchain-verified records.</p>
                </div>

                <div className="space-y-4">
                  {metamaskError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-xs font-bold leading-relaxed">{metamaskError}</p>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => connect(true)}
                    disabled={isConnecting || isFinalizing}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isConnecting || isFinalizing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isConnecting ? 'Connecting...' : 'Verifying...'}
                      </>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5" />
                        {walletAddress ? 'Switch MetaMask Account' : 'Connect MetaMask'}
                      </>
                    )}
                  </motion.button>

                  {walletAddress && !isFinalizing && (
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Connected Wallet</p>
                          <p className="text-xs font-mono font-bold text-on-surface">{formatAddress(walletAddress)}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleFinalizeLogin(walletAddress)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Verify & Continue
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={() => handleFinalizeLogin()}
                    disabled={isFinalizing}
                    className="w-full py-4 rounded-2xl bg-surface-container-low text-outline font-bold hover:text-on-surface transition-all disabled:opacity-50"
                  >
                    Skip for Now
                  </button>
                </div>

                <div className="mt-12 space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/5">
                    <Shield className="w-5 h-5 text-teal-500" />
                    <p className="text-[10px] font-medium text-outline leading-tight">
                      Connecting a wallet enables end-to-end encryption and immutable audit logs for your medical data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
