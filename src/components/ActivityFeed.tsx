import React, { useState, useEffect, useCallback } from 'react';
import { Link, Key, FileText, Loader2, Database, RefreshCw } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { fetchAuditLog } from '../services/blockchainService';

export function ActivityFeed() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const logs = await fetchAuditLog();
      
      // Map blockchain logs to activity format
      const mappedActivities = logs.slice(0, 5).map((log, index) => ({
        id: index,
        icon: Database,
        title: `Blockchain Entry: ${log.recordType}`,
        time: log.formattedDate,
        description: `Transaction: ${log.transactionHash.slice(0, 10)}...${log.transactionHash.slice(-8)}`,
        tag: log.isPendingSync ? 'SYNCING...' : 'VERIFIED IMMUTABLE',
        color: log.isPendingSync ? 'text-outline bg-surface-container-high' : 'text-primary bg-primary/5 hover:bg-primary',
        isSimulated: log.isSimulated
      }));

      setActivities(mappedActivities);
    } catch (err) {
      console.error("Failed to fetch activity feed:", err);
      // Fallback to mock data if blockchain fails
      setActivities([
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
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    
    const handleRefresh = () => loadActivities(false);
    window.addEventListener('blockchain-update', handleRefresh);
    return () => window.removeEventListener('blockchain-update', handleRefresh);
  }, [loadActivities]);

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-headline font-bold text-on-surface">System Activity Feed</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => loadActivities()}
            className="p-2 rounded-full hover:bg-surface-container-high text-outline transition-colors"
            title="Refresh Feed"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <span className="px-3 py-1 rounded-full bg-primary-container text-white text-xs font-semibold cursor-pointer">Blockchain</span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-outline">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-bold">Synchronizing Feed...</p>
          </div>
        ) : activities.length > 0 ? (
          activities.map((activity) => (
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
                  {activity.isSimulated && (
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter">Simulated</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
            <p className="text-sm font-bold text-outline">No recent activity detected.</p>
          </div>
        )}
      </div>
    </div>
  );
}
