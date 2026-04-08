import React from 'react';
import { Upload, UserPlus, Share2, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface QuickActionsProps {
  onUploadClick?: () => void;
  onGrantAccessClick?: () => void;
  onEmergencyClick?: () => void;
}

export function QuickActions({ onUploadClick, onGrantAccessClick, onEmergencyClick }: QuickActionsProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-headline font-bold text-on-surface">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadClick}
          className="flex items-center justify-between p-4 rounded-2xl bg-primary text-white hover:shadow-xl hover:shadow-primary/20 transition-all w-full"
        >
          <div className="flex items-center gap-4">
            <Upload className="w-6 h-6" />
            <div className="text-left">
              <p className="font-bold">Upload Report</p>
              <p className="text-[11px] opacity-70">Add medical PDF or DICOM</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGrantAccessClick}
          className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high text-on-surface hover:bg-surface-variant transition-all w-full"
        >
          <div className="flex items-center gap-4">
            <UserPlus className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-bold">Grant Access</p>
              <p className="text-[11px] text-outline">Manage practitioner permissions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-outline" />
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEmergencyClick}
          className="flex items-center justify-between p-4 rounded-2xl bg-error-container text-on-error-container hover:shadow-lg hover:shadow-error/10 transition-all w-full"
        >
          <div className="flex items-center gap-4">
            <Share2 className="w-6 h-6 text-red-600 fill-red-600/20" />
            <div className="text-left">
              <p className="font-bold">Emergency Share</p>
              <p className="text-[11px] text-red-600/70">Instant broadcast to nearest EMS</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
