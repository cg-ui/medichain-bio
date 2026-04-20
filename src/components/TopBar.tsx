import React from 'react';
import { Search, Bell, Moon, Sun, Share2, LogOut, Wallet, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useMetaMask } from '../hooks/useMetaMask';
import { cn } from '@/src/lib/utils';
import { UserProfile } from '../types';

interface TopBarProps {
  user?: UserProfile;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
}

export function TopBar({ user, isDarkMode, onToggleDarkMode, onLogout }: TopBarProps) {
  const { walletAddress, connect, isConnecting } = useMetaMask();

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 bg-background/80 backdrop-blur-xl z-40 font-headline tracking-tight shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search patient IDs, hashes, or records..."
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 text-sm transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Wallet Status */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/10">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            walletAddress ? "bg-teal-500" : "bg-outline"
          )} />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-outline uppercase tracking-tighter leading-none mb-1">
              {walletAddress ? 'Connected Wallet' : 'Wallet Disconnected'}
            </span>
            <span className="text-[11px] font-mono font-bold text-on-surface leading-none">
              {walletAddress ? formatAddress(walletAddress) : 'No Wallet'}
            </span>
          </div>
          <button 
            onClick={() => connect(true)}
            disabled={isConnecting}
            className="ml-2 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
            title="Switch Account"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isConnecting && "animate-spin")} />
          </button>
        </div>

        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          <Share2 className="w-5 h-5 text-primary-container" />
          <span className="text-sm font-bold text-primary-container">Emergency Share</span>
        </motion.div>
        
        <div className="h-6 w-[1px] bg-outline-variant/30 mx-2" />
        
        <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
          <Bell className="w-5 h-5 text-on-surface-variant" />
        </button>
        
        <button 
          onClick={onToggleDarkMode}
          className="p-2 rounded-full hover:bg-surface-container-low transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-on-surface-variant" />
          ) : (
            <Moon className="w-5 h-5 text-on-surface-variant" />
          )}
        </button>
        
        <div className="flex items-center gap-3 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-on-surface leading-none mb-1">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">
              {user?.role || 'Guest'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform">
            <img 
              src={`https://picsum.photos/seed/${user?.email || 'default'}/100/100`} 
              alt="User profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          {onLogout && (
            <button 
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
