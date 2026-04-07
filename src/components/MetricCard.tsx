import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cn } from '@/src/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  status: string;
  colorClass: string;
  data: any[];
}

export function MetricCard({ icon: Icon, label, value, unit, status, colorClass, data }: MetricCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 relative overflow-hidden group">
      <div className={cn("absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity", colorClass)}>
        <Icon className="w-16 h-16" />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className={cn("flex items-center gap-2", colorClass)}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" /> {status}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-headline font-extrabold tracking-tight">{value}</span>
        <span className="text-outline font-medium">{unit}</span>
      </div>

      <div className="h-16 w-full opacity-50">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar 
              dataKey="value" 
              fill="currentColor" 
              className={colorClass} 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
