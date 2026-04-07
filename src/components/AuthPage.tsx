import React, { useState } from 'react';
import { Shield, User, Stethoscope, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome, Apple } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auth failed');
      
      if (isLogin) {
        if (data.isDemo) setIsDemo(true);
        onLogin(data.user);
      } else {
        setIsLogin(true);
        setError('Account created! Please sign in.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              role === 'patient' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-white hover:border-primary/30"
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
              role === 'doctor' ? "border-primary bg-primary/5 shadow-xl" : "border-outline-variant/20 bg-white hover:border-primary/30"
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
          <div className="flex bg-surface-container-low p-1 rounded-full mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={cn("flex-1 py-3 rounded-full text-sm font-bold transition-all", isLogin ? "bg-white shadow-sm text-primary" : "text-outline")}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={cn("flex-1 py-3 rounded-full text-sm font-bold transition-all", !isLogin ? "bg-white shadow-sm text-primary" : "text-outline")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline mb-2 block">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dr.smith@hospital.com"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">Password</label>
                <button type="button" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 text-sm outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs font-bold text-red-500 text-center">{error}</p>}

            <div className="flex items-center gap-3">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20" />
              <label htmlFor="remember" className="text-xs font-medium text-on-surface-variant">Keep me logged in on this clinical workstation</label>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? "Processing..." : isLogin ? "Secure Sign In" : "Create Secure Account"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-outline">
              <span className="bg-surface-container-lowest px-4">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-all">
              <Chrome className="w-5 h-5" />
              <span className="text-sm font-bold">Google</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 rounded-2xl border border-outline-variant/20 hover:bg-surface-container-low transition-all">
              <Apple className="w-5 h-5" />
              <span className="text-sm font-bold">Apple</span>
            </button>
          </div>

          <p className="mt-8 text-[10px] text-center text-outline leading-relaxed">
            By signing in, you agree to our <button className="text-primary font-bold hover:underline">Privacy Architecture</button> and <button className="text-primary font-bold hover:underline">Sovereignty Protocols</button>.
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
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-600">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
          Secure Network: Active
        </div>
      </div>
    </div>
  );
}
