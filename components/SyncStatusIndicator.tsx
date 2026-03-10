import React from 'react';
import { SyncStatus } from '../types';
import { Cloud, CloudOff, Loader2, CloudCheck, AlertCircle } from 'lucide-react';

interface SyncStatusIndicatorProps {
    status: SyncStatus;
    isLoggedIn: boolean;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, isLoggedIn }) => {
    if (!isLoggedIn) return null;

    const config: Record<SyncStatus, { icon: React.ReactNode; label: string; color: string }> = {
        idle: {
            icon: <Cloud size={14} />,
            label: 'Klar',
            color: 'text-slate-400',
        },
        syncing: {
            icon: <Loader2 size={14} className="animate-spin" />,
            label: 'Syncer…',
            color: 'text-blue-400',
        },
        synced: {
            icon: <CloudCheck size={14} />,
            label: 'Synket',
            color: 'text-emerald-400',
        },
        error: {
            icon: <AlertCircle size={14} />,
            label: 'Feil',
            color: 'text-red-400',
        },
        offline: {
            icon: <CloudOff size={14} />,
            label: 'Frakoblet',
            color: 'text-slate-500',
        },
    };

    const { icon, label, color } = config[status];

    return (
        <div className={`flex items-center gap-1 text-xs ${color}`} title={`Sky-sync: ${label}`}>
            {icon}
            <span>{label}</span>
        </div>
    );
};

export default SyncStatusIndicator;
