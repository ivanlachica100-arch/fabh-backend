import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  X, 
  Terminal, 
  RotateCcw, 
  Loader2 
} from 'lucide-react';

export default function AdminAuditLogsModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/logs');
      setLogs(res.data.data || res.data || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">System Activity & Audit Logs</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Trace actions, registrations, and application decisions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Refresh logs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          {loading ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs">Reading security audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center py-12 text-xs text-slate-400 dark:text-slate-500">No logs recorded yet.</p>
          ) : (
            logs.map((log) => (
              <div 
                key={log._id} 
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex flex-col gap-1 transition-colors"
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {log.action}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.userEmail || 'System'}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">{log.details}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}