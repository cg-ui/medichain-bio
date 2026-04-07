import React from 'react';
import { Link, Key, FileText } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const activities = [
  {
    id: 1,
    icon: Link,
    title: 'Blockchain Entry: Lab Results Encrypted',
    time: '2m ago',
    description: 'Block #482,910 validated by Sanctuary Node 04. Hash: 0x8f2...e32a',
    tag: 'VERIFIED IMMUTABLE',
    color: 'text-primary bg-primary/5 hover:bg-primary'
  },
  {
    id: 2,
    icon: Key,
    title: 'Access Granted: Dr. Aris Thorne',
    time: '45m ago',
    description: 'Radiology Dept. accessed 2023_MRI_Spine.dcm via temporary clinical bridge.',
    tag: 'TEMPORARY TOKEN',
    tagColor: 'bg-secondary-container text-on-secondary-container',
    color: 'text-secondary bg-secondary/5 hover:bg-secondary'
  },
  {
    id: 3,
    icon: FileText,
    title: 'New Medical Update',
    time: '3h ago',
    description: 'Prescription adjustment: Lisinopril dosage reduced to 10mg daily.',
    tag: 'CLINICAL NOTE',
    color: 'text-tertiary bg-tertiary/5 hover:bg-tertiary'
  }
];

export function ActivityFeed() {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-headline font-bold text-on-surface">System Activity Feed</h3>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-outline-variant cursor-pointer hover:bg-surface-variant transition-colors">All</span>
          <span className="px-3 py-1 rounded-full bg-primary-container text-white text-xs font-semibold cursor-pointer">Blockchain</span>
          <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-outline-variant cursor-pointer hover:bg-surface-variant transition-colors">Medical</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id}
            className="flex items-start gap-4 p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/5 shadow-sm group transition-all duration-300"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:text-white",
              activity.color
            )}>
              <activity.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-on-surface">{activity.title}</h4>
                <span className="text-[11px] font-medium text-outline">{activity.time}</span>
              </div>
              <p className="text-sm text-on-surface-variant mb-2">{activity.description}</p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  activity.tagColor || "bg-surface-container-high text-outline-variant"
                )}>
                  {activity.tag}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
