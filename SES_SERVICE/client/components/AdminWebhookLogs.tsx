import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Database } from 'lucide-react';

interface WebhookLog {
    id: string;
    payload: any;
    receivedAt: string;
    status: 'success' | 'failed';
    error?: string;
}

const AdminWebhookLogs: React.FC = () => {
    const [logs, setLogs] = useState<WebhookLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${API_BASE_URL}/api/webhook-logs`);
            const result = await response.json();

            if (result.success) {
                setLogs(result.data);
            }
        } catch (error) {
            console.error('Error fetching webhook logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Webhook Activity Logs</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm uppercase tracking-widest">
                        Real-time Webhook Event Monitor
                    </p>
                </div>
                <button
                    onClick={() => fetchLogs(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="font-bold text-sm">Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Events</p>
                            <p className="text-3xl font-black text-white">{logs.length}</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-indigo-400" />
                        </div>
                    </div>
                </div>

                <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Successful</p>
                            <p className="text-3xl font-black text-emerald-400">
                                {logs.filter(log => log.status === 'success').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="glass-morphism p-6 rounded-3xl border border-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Failed</p>
                            <p className="text-3xl font-black text-red-400">
                                {logs.filter(log => log.status === 'failed').length}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="glass-morphism rounded-[40px] border border-white/5 overflow-hidden">
                {loading ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Loading Logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-32 flex flex-col items-center gap-4">
                        <Database className="h-16 w-16 text-slate-700" />
                        <p className="text-slate-500 font-bold uppercase text-sm tracking-widest">No Webhook Events Yet</p>
                        <p className="text-slate-600 text-xs">Webhook events will appear here when received</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {logs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-white/[0.02] transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        {/* Status and Time */}
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${log.status === 'success'
                                                ? 'bg-emerald-500/10 border border-emerald-500/20'
                                                : 'bg-red-500/10 border border-red-500/20'
                                                }`}>
                                                {log.status === 'success' ? (
                                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-red-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm uppercase tracking-tight ${log.status === 'success' ? 'text-emerald-400' : 'text-red-400'
                                                    }`}>
                                                    {log.status}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{formatDate(log.receivedAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {log.error && (
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Error</p>
                                                <p className="text-sm text-red-300 font-mono">{log.error}</p>
                                            </div>
                                        )}

                                        {/* Payload */}
                                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Payload Data</p>
                                            <pre className="text-xs text-slate-300 font-mono overflow-x-auto bg-slate-950/50 p-3 rounded-xl">
                                                {JSON.stringify(log.payload, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminWebhookLogs;
