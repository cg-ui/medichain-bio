import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Database, 
  Key, 
  ShieldAlert, 
  Upload, 
  Settings, 
  HelpCircle,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'patient-profile', icon: Users, label: 'Patient Profile' },
  { id: 'patients', icon: Users, label: 'Patients' },
  { id: 'reports', icon: FileText, label: 'Reports' },
  { id: 'blockchain', icon: Database, label: 'Blockchain' },
  { id: 'access-control', icon: Key, label: 'Access Control' },
  { id: 'emergency', icon: ShieldAlert, label: 'Emergency' },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
  onLogout?: () => void;
  onUploadClick?: () => void;
}

export function Sidebar({ activeTab, onTabChange, onLogout, onUploadClick }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r-0 flex flex-col p-4 gap-2 z-50">
      <div className="flex items-center gap-3 px-3 py-6 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Shield className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h1 className="font-headline font-extrabold tracking-tighter text-primary text-xl leading-none">MediChain</h1>
          <p className="text-[10px] uppercase tracking-widest text-outline">Sovereign Sanctuary</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left w-full",
              activeTab === item.id 
                ? "bg-surface-container-lowest text-primary shadow-sm" 
                : "text-on-surface-variant hover:bg-surface-container-low hover:translate-x-1"
            )}
          >
            <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-primary" : "text-on-surface-variant")} />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/20 flex flex-col gap-1">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadClick}
          className="w-full mb-4 py-3 px-4 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload Report</span>
        </motion.button>
        
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Support</span>
        </a>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
